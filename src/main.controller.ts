import { Controller } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { BucketAlreadyExists } from '@aws-sdk/client-s3';
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
	Status,
	StatusRequest,
	StatusResponse,
	UpdateRequest,
	UpdateResponse,
	UsageRequest,
	UsageResponse,
	UsageType,
} from './generated/co/mechen/distr/common/v1';
import {
	MainServiceController,
	MainServiceControllerMethods,
} from './generated/main';
import { HelperService } from './helper/helper.service';
import { CreateBucketDTO } from './s3/dto/create-bucket.dto';
import { UpdateBucketDTO } from './s3/dto/update-bucket.dto';
import { S3Service } from './s3/s3.service';

@Controller()
@MainServiceControllerMethods()
export class MainController implements MainServiceController {
	constructor(
		private readonly s3Service: S3Service,
		private readonly helperService: HelperService,
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
							description:
								'Bucket name (must be globally unique)',
							type: Field_Type.STRING,
							required: true,
							fields: {},
						},
						{
							name: 'access',
							description:
								'ACL Access Level (private, public-read, public-read-write, authenticated-read)',
							type: Field_Type.STRING,
							required: false,
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
							name: 'access',
							description:
								'ACL Access Level (private, public-read, public-read-write, authenticated-read)',
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

		const details = await this.s3Service.findByID(
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

		const status = await this.s3Service.getStatus(
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
			CreateBucketDTO,
			request.payload,
		);

		try {
			const status = await this.s3Service.create(
				credentials,
				request.resourceId,
				input,
			);
			return { status };
		} catch (err) {
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
			UpdateBucketDTO,
			request.payload,
		);

		try {
			const status = await this.s3Service.update(
				credentials,
				request.resourceId,
				input,
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
					};
			}
		}
	}

	async delete(request: DeleteRequest): Promise<DeleteResponse> {
		const credentials = request.credentials.aws;
		if (!credentials) throw new MissingCredentialsException('AWS');

		try {
			const status = await this.s3Service.delete(
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
