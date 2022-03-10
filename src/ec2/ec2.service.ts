import {
	AuthorizeSecurityGroupEgressCommand,
	AuthorizeSecurityGroupIngressCommand,
	CreateKeyPairCommand,
	CreateSecurityGroupCommand,
	DescribeInstancesCommand,
	DescribeInstanceStatusCommand,
	EC2Client,
	ModifyInstanceAttributeCommand,
	RunInstancesCommand,
	TerminateInstancesCommand,
} from '@aws-sdk/client-ec2';
import { wrap } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { AWSCredentials, Status } from '../generated/co/mechen/distr/common/v1';
import { HelperService } from '../shared/helper/helper.service';
import { CreateEC2DTO } from './dto/create-ec2.dto';
import { UpdateEC2DTO } from './dto/update-ec2.dto';
import { EC2 } from './ec2.entity';

@Injectable()
export class Ec2Service {
	constructor(
		@InjectRepository(EC2)
		private readonly ec2Repository: EntityRepository<EC2>,
		private readonly helperService: HelperService,
	) {}

	async findByID(credentials: AWSCredentials, resourceId: string) {
		const client = this.connect(credentials);
		const ec2 = await this.ec2Repository.findOneOrFail({
			resourceId,
		});

		const describeInstanceCommand = new DescribeInstancesCommand({
			InstanceIds: [ec2.instanceId],
		});
		const res = await client.send(describeInstanceCommand);

		const instance = res.Reservations?.[0].Instances?.[0];

		return {
			id: instance.InstanceId,
			image: instance.ImageId,
			securityGroup: instance.SecurityGroups[0]?.GroupId,
			type: instance.InstanceType,
			ipAddress: instance.PublicIpAddress ?? 'unknown',
			state: instance.State.Name,
		};
	}

	async getStatus(credentials: AWSCredentials, resourceId: string) {
		const client = this.connect(credentials);
		const ec2 = await this.ec2Repository.findOneOrFail({
			resourceId,
		});

		try {
			const describeInstanceStatusCommand =
				new DescribeInstanceStatusCommand({
					InstanceIds: [ec2.instanceId],
				});
			const res = await client.send(describeInstanceStatusCommand);
			const status = res.InstanceStatuses?.[0]?.InstanceStatus?.Status;

			switch (status) {
				case 'ok':
					return Status.HEALTHY;
				case 'insufficient-data':
				case 'initializing':
					return Status.DEGRADED;
				default:
					return Status.DOWN;
			}
		} catch (err) {
			console.log(err);
			switch (err.name) {
				case 'NotFound':
					return Status.DOWN;
				default:
					return Status.DEGRADED;
			}
		}
	}

	async create(
		credentials: AWSCredentials,
		resourceId: string,
		input: CreateEC2DTO,
	) {
		const client = this.connect(credentials);

		const key = await this.createKeyPair(input.name, client);
		const securityGroup = await this.createSecurityGroup(
			input.name,
			client,
		);

		const runInstanceCommand = new RunInstancesCommand({
			MinCount: 1,
			MaxCount: 1,
			InstanceType: input.instanceType,
			ImageId: input.image,
			KeyName: key.name,
			SecurityGroupIds: [securityGroup],
			TagSpecifications: [
				{
					ResourceType: 'instance',
					Tags: [
						{
							Key: 'Name',
							Value: input.name,
						},
					],
				},
			],
		});

		const response = await client.send(runInstanceCommand);

		const instance = response.Instances?.[0];
		if (!instance) return false;

		const ec2 = this.ec2Repository.create({
			resourceId,
			instanceId: instance.InstanceId,
		});
		wrap(ec2);
		await this.ec2Repository.persistAndFlush(ec2);

		return {
			id: instance.InstanceId,
			image: instance.ImageId,
			securityGroup: instance.SecurityGroups[0].GroupId,
			type: instance.InstanceType,
			ipAddress: instance.PublicIpAddress ?? 'unknown',
			state: instance.State.Name,
			keyName: key.name,
			keySecret: key.secret,
		};
	}

	async update(
		credentials: AWSCredentials,
		resourceId: string,
		input: UpdateEC2DTO,
	) {
		const client = this.connect(credentials);
		const ec2 = await this.ec2Repository.findOneOrFail({
			resourceId,
		});

		const modifyAttributeCommand = new ModifyInstanceAttributeCommand({
			InstanceId: ec2.instanceId,
			InstanceType: input.type
				? {
						Value: input.type,
				  }
				: undefined,
			EbsOptimized:
				input.ebsOptimised != null
					? {
							Value: input.ebsOptimised,
					  }
					: undefined,
		});

		const response = await client.send(modifyAttributeCommand);

		return true;
	}

	async delete(credentials: AWSCredentials, resourceId: string) {
		const client = this.connect(credentials);
		const ec2 = await this.ec2Repository.findOneOrFail({
			resourceId,
		});

		const command = new TerminateInstancesCommand({
			InstanceIds: [ec2.instanceId],
		});

		const response = await client.send(command);
		await this.ec2Repository.removeAndFlush(ec2);

		return response.TerminatingInstances.length > 0;
	}

	private connect(credentials: AWSCredentials): EC2Client {
		return new EC2Client({
			region: credentials.region,
			credentials: {
				accessKeyId: credentials.id,
				secretAccessKey: credentials.secret,
			},
		});
	}

	private async createKeyPair(name: string, client: EC2Client) {
		const createKeyCommand = new CreateKeyPairCommand({
			KeyName: `${name}-${this.helperService.random()}`,
		});
		const key = await client.send(createKeyCommand);
		if (!key.KeyName) throw new Error('Failed to create key pair');

		return {
			id: key.KeyPairId,
			name: key.KeyName,
			secret: key.KeyMaterial,
		};
	}

	private async createSecurityGroup(name: string, client: EC2Client) {
		const createGroupCommand = new CreateSecurityGroupCommand({
			GroupName: `${name}-${this.helperService.random()}`,
			Description: `Auto generated security group for the ${name} instance. Allows SSH and Web access by default.`,
		});

		const group = await client.send(createGroupCommand);
		if (!group.GroupId) throw new Error('Failed to create security group');

		const inbound = new AuthorizeSecurityGroupIngressCommand({
			GroupId: group.GroupId,
			IpPermissions: [
				{
					IpProtocol: 'tcp',
					FromPort: 22,
					ToPort: 22,
					IpRanges: [
						{
							CidrIp: '0.0.0.0/0',
						},
					],
				},
				{
					IpProtocol: 'tcp',
					FromPort: 80,
					ToPort: 80,
					IpRanges: [
						{
							CidrIp: '0.0.0.0/0',
						},
					],
				},
				{
					IpProtocol: 'tcp',
					FromPort: 443,
					ToPort: 443,
					IpRanges: [
						{
							CidrIp: '0.0.0.0/0',
						},
					],
				},
			],
		});

		const outbound = new AuthorizeSecurityGroupEgressCommand({
			GroupId: group.GroupId,
			IpPermissions: [
				{
					IpProtocol: '-1',
					IpRanges: [
						{
							CidrIp: '0.0.0.0/0',
						},
					],
				},
			],
		});

		await client.send(inbound);
		try {
			await client.send(outbound);
		} catch (e) {
			// Outbound rule aready exists
		}

		return group.GroupId;
	}
}
