import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { MissingCredentialsException } from './exceptions/missing-credentials.exception';
import {
	CreateRequest,
	CreateResponse,
	DeleteRequest,
	DeleteResponse,
	Field_Type,
	GetRequest,
	GetResponse,
	Method,
	ReflectMethodRequest,
	ReflectMethodResponse,
	StatusRequest,
	StatusResponse,
	UpdateRequest,
	UpdateResponse,
	UsageResponse,
	UsageType,
} from './generated/co/mechen/distr/common/v1';
import { MainServiceController } from './generated/main';
import { HelperService } from './shared/helper/helper.service';
import { Ec2Service } from './ec2/ec2.service';
import { CreateEC2DTO } from './ec2/dto/create-ec2.dto';
import { UpdateEC2DTO } from './ec2/dto/update-ec2.dto';
import { Injectable } from '@nestjs/common';

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
							type: Field_Type.STRING,
							required: true,
							fields: {},
						},
						{
							name: 'public',
							description: 'Are the objects publically visible?',
							type: Field_Type.BOOLEAN,
							required: true,
							fields: {},
						},
						{
							name: 'location',
							description: 'Region the bucket is hosted in',
							type: Field_Type.STRING,
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
							type: Field_Type.STRING,
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
							type: Field_Type.STRING,
							required: false,
							fields: {},
						},
					],
					outputs: [],
				};
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

	async usage(): Promise<UsageResponse> {
		return {
			type: UsageType.UNLIMITED,
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
				case 'BucketAlreadyExists':
					throw new RpcException({
						message:
							'A bucket with that name already exists. Bucket names must be unique.',
						code: GrpcStatus.ALREADY_EXISTS,
					});
				case 'InvalidSecurity':
				case 'InvalidAccessKeyId':
					throw new RpcException({
						code: GrpcStatus.PERMISSION_DENIED,
						message: 'The given credentials are not valid',
					});
				case 'BucketAlreadyOwnedByYou':
					throw new RpcException({
						message:
							'You already have a bucket with that name. Bucket names must be unique.',
						code: GrpcStatus.ALREADY_EXISTS,
					});
				case 'InvalidBucketName':
					throw new RpcException({
						message: 'That bucket name is invalid',
						code: GrpcStatus.FAILED_PRECONDITION,
					});
				case 'TooManyBuckets':
					throw new RpcException({
						message: 'You have too many existing S3 buckets',
						code: GrpcStatus.OUT_OF_RANGE,
					});
				case 'InvalidBucketName':
					throw new RpcException({
						message: 'That bucket name is invalid',
						code: GrpcStatus.FAILED_PRECONDITION,
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
				case 'AccessDenied':
					throw new RpcException({
						code: GrpcStatus.PERMISSION_DENIED,
						message: 'You do not have access to that bucket',
					});
				case 'NoSuchBucket':
					throw new RpcException({
						code: GrpcStatus.NOT_FOUND,
						message: 'No bucket could be found with that name',
					});
				case 'InvalidSecurity':
				case 'InvalidAccessKeyId':
					throw new RpcException({
						code: GrpcStatus.PERMISSION_DENIED,
						message: 'The given credentials are not valid',
					});
				default:
					return {
						status: false,
						properties: [],
					};
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
				case 'AccessDenied':
					throw new RpcException({
						code: GrpcStatus.PERMISSION_DENIED,
						message: 'You do not have access to that bucket',
					});
				case 'InvalidSecurity':
				case 'InvalidAccessKeyId':
					throw new RpcException({
						code: GrpcStatus.PERMISSION_DENIED,
						message: 'The given credentials are not valid',
					});
				case 'BucketNotEmpty':
					throw new RpcException({
						code: GrpcStatus.FAILED_PRECONDITION,
						message:
							'Buckets must be empty before they can be deleted',
					});
				default:
					return {
						status: false,
					};
			}
		}
	}
}
