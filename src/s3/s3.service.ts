import {
	CreateBucketCommand,
	DeleteBucketCommand,
	GetBucketLocationCommand,
	HeadBucketCommand,
	ListObjectsV2Command,
	PutBucketAclCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { wrap } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { AWSCredentials, Status } from '../generated/co/mechen/distr/common/v1';
import { CreateBucketDTO } from './dto/create-bucket.dto';
import { UpdateBucketDTO } from './dto/update-bucket.dto';
import { S3 } from './s3.entity';

@Injectable()
export class S3Service {
	constructor(
		@InjectRepository(S3)
		private readonly s3Repository: EntityRepository<S3>,
	) {}

	async findByID(credentials: AWSCredentials, resourceId: string) {
		const client = this.connect(credentials);
		const s3 = await this.s3Repository.findOneOrFail({
			resourceId,
		});

		const locationCommand = new GetBucketLocationCommand({
			Bucket: s3.name,
		});
		const location = await client.send(locationCommand);

		const itemsCommand = new ListObjectsV2Command({
			Bucket: s3.name,
		});
		const items = await client.send(itemsCommand);

		return {
			name: s3.name,
			location: location.LocationConstraint,
			items: items.KeyCount,
			size: items.Contents.reduce(
				(current, item) => current + item.Size,
				0,
			),
		};
	}

	async getStatus(credentials: AWSCredentials, resourceId: string) {
		const client = this.connect(credentials);
		const s3 = await this.s3Repository.findOneOrFail({
			resourceId,
		});

		const headCommand = new HeadBucketCommand({
			Bucket: s3.name,
		});
		try {
			await client.send(headCommand);
		} catch (err) {
			switch (err.name) {
				case 'NotFound':
					return Status.DOWN;
				default:
					return Status.DEGRADED;
			}
		}

		return Status.HEALTHY;
	}

	async create(
		credentials: AWSCredentials,
		resourceId: string,
		input: CreateBucketDTO,
	) {
		const client = this.connect(credentials);
		const s3 = this.s3Repository.create({
			resourceId,
			name: input.name,
		});
		wrap(s3);

		const command = new CreateBucketCommand({
			Bucket: input.name,
			ACL: input.access,
			CreateBucketConfiguration: {
				LocationConstraint: credentials.region,
			},
		});

		const response = await client.send(command);
		await this.s3Repository.persistAndFlush(s3);

		return !!response.Location;
	}

	async update(
		credentials: AWSCredentials,
		resourceId: string,
		input: UpdateBucketDTO,
	) {
		const client = this.connect(credentials);
		const s3 = await this.s3Repository.findOneOrFail({
			resourceId,
		});

		const command = new PutBucketAclCommand({
			Bucket: s3.name,
			ACL: input.access,
		});

		const response = await client.send(command);
		return !!response;
	}

	async delete(credentials: AWSCredentials, resourceId: string) {
		const client = this.connect(credentials);
		const s3 = await this.s3Repository.findOneOrFail({
			resourceId,
		});

		const command = new DeleteBucketCommand({
			Bucket: s3.name,
		});

		const response = await client.send(command);
		await this.s3Repository.removeAndFlush(s3);

		return !!response;
	}

	private connect(credentials: AWSCredentials): S3Client {
		return new S3Client({
			region: credentials.region,
			credentials: {
				accessKeyId: credentials.id,
				secretAccessKey: credentials.secret,
			},
		});
	}
}
