import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { MissingCredentialsException } from './exceptions/missing-credentials.exception';
import {
	CreateRequest,
	CreateResponse,
	DeleteRequest,
	DeleteResponse,
	Field_Type as FieldType,
	GetRequest,
	GetResponse,
	Method,
	ReflectMethodRequest,
	ReflectMethodResponse,
	StatusRequest,
	StatusResponse,
	UpdateRequest,
	UpdateResponse,
	UsageRequest,
	UsageResponse,
	UsageType,
} from './generated/co/mechen/distr/common/v1';
import { MainServiceController } from './generated/main';
import { HelperService } from './shared/helper/helper.service';
import { Ec2Service } from './ec2/ec2.service';
import { CreateEC2DTO } from './ec2/dto/create-ec2.dto';
import { UpdateEC2DTO } from './ec2/dto/update-ec2.dto';

@Injectable()
export class MainController implements MainServiceController {
	constructor(
		protected readonly ec2Service: Ec2Service,
		protected readonly helperService: HelperService,
	) {}

	reflect(request: ReflectMethodRequest): ReflectMethodResponse {
		switch (request.method) {
			case Method.GET:
				return {
					method: Method.GET,
					inputs: [],
					outputs: [
						{
							name: 'name',
							description: 'Bucket name (globally unique)',
							type: FieldType.STRING,
							required: true,
							fields: {},
						},
						{
							name: 'public',
							description: 'Are the objects publically visible?',
							type: FieldType.BOOLEAN,
							required: true,
							fields: {},
						},
						{
							name: 'location',
							description: 'Region the bucket is hosted in',
							type: FieldType.STRING,
							required: false,
							fields: {},
						},
					],
				};
			case Method.CREATE:
				return {
					method: Method.CREATE,
					inputs: [
						{
							name: 'name',
							description: 'EC2 instance name',
							type: FieldType.STRING,
							required: true,
							fields: {},
						},
					],
					outputs: [],
				};
			case Method.UPDATE:
				return {
					method: Method.UPDATE,
					inputs: [
						{
							name: 'instanceType',
							description: 'Chance the instance type',
							type: FieldType.STRING,
							required: false,
							fields: {},
						},
					],
					outputs: [],
				};
			default: {
				return {
					method: Method.UNRECOGNIZED,
					inputs: [],
					outputs: [],
				};
			}
		}
	}

	async get(request: GetRequest): Promise<GetResponse> {
		const credentials = request.credentials.aws;
		if (!credentials) throw new MissingCredentialsException('AWS');

		const details = await this.ec2Service.findByID(
			credentials,
			request.resourceId,
		);

		return {
			properties: this.helperService.dtoToPayload(details),
		};
	}

	async status(request: StatusRequest): Promise<StatusResponse> {
		const credentials = request.credentials.aws;
		if (!credentials) throw new MissingCredentialsException('AWS');

		const status = await this.ec2Service.getStatus(
			credentials,
			request.resourceId,
		);

		return {
			status,
		};
	}

	async usage(request: UsageRequest): Promise<UsageResponse> {
		const credentials = request.credentials.aws;
		if (!credentials) throw new MissingCredentialsException('AWS');

		const usage = await this.ec2Service.getUsage(
			credentials,
			request.resourceId,
		);

		if (usage == undefined)
			return {
				type: UsageType.UNLIMITED,
			};

		return {
			type: UsageType.LIMITED,
			current: usage,
			limit: 100,
		};
	}

	async create(request: CreateRequest): Promise<CreateResponse> {
		const credentials = request.credentials.aws;
		if (!credentials) throw new MissingCredentialsException('AWS');
		const input = await this.helperService.payloadToDTO(
			CreateEC2DTO,
			request.payload,
		);

		try {
			const res = await this.ec2Service.create(
				credentials,
				request.resourceId,
				input,
			);
			const properties = res ? this.helperService.dtoToPayload(res) : [];

			return {
				status: !!res,
				properties,
			};
		} catch (err) {
			console.log(err);
			switch (err.name) {
				case 'InvalidAction':
					throw new RpcException({
						message:
							'The action or operation requested is not valid. Verify that the action is typed correctly.',
						code: GrpcStatus.INVALID_ARGUMENT,
					});
				case 'InvalidCharacter':
				case 'InvalidParameter':
				case 'InvalidParameterValue':
					throw new RpcException({
						code: GrpcStatus.INVALID_ARGUMENT,
						message: 'The specified input is not valid.',
					});
				case 'DefaultVpcDoesNotExist':
					throw new RpcException({
						message: 'The default VPC no longer exists.',
						code: GrpcStatus.ABORTED,
					});
				case 'InstanceLimitExceeded':
				case 'HostLimitExceeded':
					throw new RpcException({
						message:
							"You've reached the limit on the number of Dedicated Hosts or instances that you can allocate.",
						code: GrpcStatus.OUT_OF_RANGE,
					});
				case 'InsufficientFreeAddressesInSubnet':
					throw new RpcException({
						message:
							'The specified subnet does not contain enough free private IP addresses to fulfill your request.',
						code: GrpcStatus.OUT_OF_RANGE,
					});
				case 'IncorrectState':
				case 'IncorrectInstanceState':
					throw new RpcException({
						message:
							'The instance is in an incorrect state for the requested action.',
						code: GrpcStatus.ABORTED,
					});
				default:
					throw new RpcException({
						code: GrpcStatus.UNKNOWN,
						message: `Unkown error occurred [${err.name}]`,
					});
			}
		}
	}

	async update(request: UpdateRequest): Promise<UpdateResponse> {
		const credentials = request.credentials.aws;
		if (!credentials) throw new MissingCredentialsException('AWS');
		const input = await this.helperService.payloadToDTO(
			UpdateEC2DTO,
			request.payload,
		);

		try {
			const status = await this.ec2Service.update(
				credentials,
				request.resourceId,
				input,
			);

			return {
				status,
				properties: [],
			};
		} catch (err) {
			switch (err.name) {
				case 'InvalidAction':
					throw new RpcException({
						message:
							'The action or operation requested is not valid. Verify that the action is typed correctly.',
						code: GrpcStatus.INVALID_ARGUMENT,
					});
				case 'InvalidCharacter':
				case 'InvalidParameter':
				case 'InvalidParameterValue':
					throw new RpcException({
						code: GrpcStatus.INVALID_ARGUMENT,
						message: 'The specified input is not valid.',
					});
				case 'DefaultVpcDoesNotExist':
					throw new RpcException({
						message: 'The default VPC no longer exists.',
						code: GrpcStatus.ABORTED,
					});
				case 'InstanceLimitExceeded':
				case 'HostLimitExceeded':
					throw new RpcException({
						message:
							"You've reached the limit on the number of Dedicated Hosts or instances that you can allocate.",
						code: GrpcStatus.OUT_OF_RANGE,
					});
				case 'InsufficientFreeAddressesInSubnet':
					throw new RpcException({
						message:
							'The specified subnet does not contain enough free private IP addresses to fulfill your request.',
						code: GrpcStatus.OUT_OF_RANGE,
					});
				case 'IncorrectState':
				case 'IncorrectInstanceState':
					throw new RpcException({
						message:
							'The instance is in an incorrect state for the requested action.',
						code: GrpcStatus.ABORTED,
					});
				default:
					throw new RpcException({
						code: GrpcStatus.UNKNOWN,
						message: `Unkown error occurred [${err.name}]`,
					});
			}
		}
	}

	async delete(request: DeleteRequest): Promise<DeleteResponse> {
		const credentials = request.credentials.aws;
		if (!credentials) throw new MissingCredentialsException('AWS');

		try {
			const status = await this.ec2Service.delete(
				credentials,
				request.resourceId,
			);

			return {
				status,
			};
		} catch (err) {
			switch (err.name) {
				case 'InvalidAction':
					throw new RpcException({
						message:
							'The action or operation requested is not valid. Verify that the action is typed correctly.',
						code: GrpcStatus.INVALID_ARGUMENT,
					});
				case 'InvalidCharacter':
				case 'InvalidParameter':
				case 'InvalidParameterValue':
					throw new RpcException({
						code: GrpcStatus.INVALID_ARGUMENT,
						message: 'The specified input is not valid.',
					});
				case 'DefaultVpcDoesNotExist':
					throw new RpcException({
						message: 'The default VPC no longer exists.',
						code: GrpcStatus.ABORTED,
					});
				case 'InstanceLimitExceeded':
				case 'HostLimitExceeded':
					throw new RpcException({
						message:
							"You've reached the limit on the number of Dedicated Hosts or instances that you can allocate.",
						code: GrpcStatus.OUT_OF_RANGE,
					});
				case 'InsufficientFreeAddressesInSubnet':
					throw new RpcException({
						message:
							'The specified subnet does not contain enough free private IP addresses to fulfill your request.',
						code: GrpcStatus.OUT_OF_RANGE,
					});
				case 'IncorrectState':
				case 'IncorrectInstanceState':
					throw new RpcException({
						message:
							'The instance is in an incorrect state for the requested action.',
						code: GrpcStatus.ABORTED,
					});
				default:
					throw new RpcException({
						code: GrpcStatus.UNKNOWN,
						message: `Unkown error occurred [${err.name}]`,
					});
			}
		}
	}
}
