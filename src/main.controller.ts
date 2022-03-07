import { Controller } from '@nestjs/common';
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
import {
	MainServiceController,
	MainServiceControllerMethods,
} from './generated/main';
import { HelperService } from './helper/helper.service';
import { SqsService } from './sqs/sqs.service';
import { CreateQueueDTO } from './sqs/dto/create-queue.dto';
import { UpdateQueueDTO } from './sqs/dto/update-queue.dto';

@Controller()
@MainServiceControllerMethods()
export class MainController implements MainServiceController {
	constructor(
		private readonly sqsService: SqsService,
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
								'Queue name (up to 80 alphanumeric characters, must end with .fifo if a FiFo queue)',
							type: Field_Type.STRING,
							required: true,
							fields: {},
						},
						{
							name: 'fifo',
							description:
								'Create a FiFo queue (leave unchecked for a standard queue)',
							type: Field_Type.BOOLEAN,
							required: false,
							defaultValue: this.helperService.value(false),
							fields: {},
						},
						{
							name: 'delay',
							description:
								'The length of time, in seconds, for which the delivery of all messages in the queue is delayed. Valid values: An integer from 0 to 900 seconds (15 minutes). Default: 0.',
							type: Field_Type.NUMBER,
							required: false,
							defaultValue: this.helperService.value(0),
							fields: {},
						},
						{
							name: 'maxMessageSize',
							description:
								'The limit of how many bytes a message can contain before Amazon SQS rejects it. Valid values: An integer from 1,024 bytes (1 KiB) to 262,144 bytes (256 KiB). Default: 262,144 (256 KiB).',
							type: Field_Type.NUMBER,
							required: false,
							defaultValue: this.helperService.value(262144),
							fields: {},
						},
						{
							name: 'messageRetentionPeriod',
							description:
								'The length of time, in seconds, for which Amazon SQS retains a message. Valid values: An integer from 60 seconds (1 minute) to 1,209,600 seconds (14 days). Default: 345,600 (4 days).',
							type: Field_Type.NUMBER,
							required: false,
							defaultValue: this.helperService.value(345600),
							fields: {},
						},
						{
							name: 'policy',
							description:
								"The queue's policy. A valid Amazon Web Services policy",
							type: Field_Type.STRUCT,
							required: false,
							fields: {},
						},
						{
							name: 'receiveMessageWaitTime',
							description:
								'The length of time, in seconds, for which a ReceiveMessage action waits for a message to arrive. Valid values: An integer from 0 to 20 (seconds). Default: 0.',
							type: Field_Type.NUMBER,
							required: false,
							defaultValue: this.helperService.value(0),
							fields: {},
						},
						{
							name: 'deadLetterTargetArn',
							description:
								'The Amazon Resource Name (ARN) of the dead-letter queue to which Amazon SQS moves messages after the value of maxReceiveCount is exceeded.',
							type: Field_Type.STRING,
							required: false,
							fields: {},
						},
						{
							name: 'maxReceiveCount',
							description:
								'The number of times a message is delivered to the source queue before being moved to the dead-letter queue. When the ReceiveCount for a message exceeds the maxReceiveCount for a queue, Amazon SQS moves the message to the dead-letter-queue.',
							type: Field_Type.NUMBER,
							required: false,
							fields: {},
						},
						{
							name: 'visibilityTimeout',
							description:
								'The visibility timeout for the queue, in seconds. Valid values: An integer from 0 to 43,200 (12 hours). Default: 30.',
							type: Field_Type.NUMBER,
							defaultValue: this.helperService.value(30),
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
							name: 'delay',
							description:
								'The length of time, in seconds, for which the delivery of all messages in the queue is delayed. Valid values: An integer from 0 to 900 seconds (15 minutes). Default: 0.',
							type: Field_Type.NUMBER,
							required: false,
							fields: {},
						},
						{
							name: 'maxMessageSize',
							description:
								'The limit of how many bytes a message can contain before Amazon SQS rejects it. Valid values: An integer from 1,024 bytes (1 KiB) to 262,144 bytes (256 KiB). Default: 262,144 (256 KiB).',
							type: Field_Type.NUMBER,
							required: false,
							fields: {},
						},
						{
							name: 'messageRetentionPeriod',
							description:
								'The length of time, in seconds, for which Amazon SQS retains a message. Valid values: An integer from 60 seconds (1 minute) to 1,209,600 seconds (14 days). Default: 345,600 (4 days).',
							type: Field_Type.NUMBER,
							required: false,
							fields: {},
						},
						{
							name: 'policy',
							description:
								"The queue's policy. A valid Amazon Web Services policy",
							type: Field_Type.STRUCT,
							required: false,
							fields: {},
						},
						{
							name: 'receiveMessageWaitTime',
							description:
								'The length of time, in seconds, for which a ReceiveMessage action waits for a message to arrive. Valid values: An integer from 0 to 20 (seconds). Default: 0.',
							type: Field_Type.NUMBER,
							required: false,
							fields: {},
						},
						{
							name: 'deadLetterTargetArn',
							description:
								'The Amazon Resource Name (ARN) of the dead-letter queue to which Amazon SQS moves messages after the value of maxReceiveCount is exceeded.',
							type: Field_Type.STRING,
							required: false,
							fields: {},
						},
						{
							name: 'maxReceiveCount',
							description:
								'The number of times a message is delivered to the source queue before being moved to the dead-letter queue. When the ReceiveCount for a message exceeds the maxReceiveCount for a queue, Amazon SQS moves the message to the dead-letter-queue.',
							type: Field_Type.NUMBER,
							required: false,
							fields: {},
						},
						{
							name: 'visibilityTimeout',
							description:
								'The visibility timeout for the queue, in seconds. Valid values: An integer from 0 to 43,200 (12 hours). Default: 30.',
							type: Field_Type.NUMBER,
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

		const details = await this.sqsService.findByID(
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

		const status = await this.sqsService.getStatus(
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
			CreateQueueDTO,
			request.payload,
		);

		try {
			const status = await this.sqsService.create(
				credentials,
				request.resourceId,
				input,
			);
			return { status };
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
			UpdateQueueDTO,
			request.payload,
		);

		try {
			const status = await this.sqsService.update(
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
			const status = await this.sqsService.delete(
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
