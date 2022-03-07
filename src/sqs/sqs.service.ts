import {
	CreateQueueCommand,
	DeleteQueueCommand,
	GetQueueAttributesCommand,
	SetQueueAttributesCommand,
	SQSClient,
} from '@aws-sdk/client-sqs';
import { wrap } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { AWSCredentials, Status } from '../generated/co/mechen/distr/common/v1';
import { CreateQueueDTO } from './dto/create-queue.dto';
import { UpdateQueueDTO } from './dto/update-queue.dto';
import { SQS } from './sqs.entity';

@Injectable()
export class SqsService {
	constructor(
		@InjectRepository(SQS)
		private readonly sqsRepository: EntityRepository<SQS>,
	) {}

	async findByID(credentials: AWSCredentials, resourceId: string) {
		const client = this.connect(credentials);
		const sqs = await this.sqsRepository.findOneOrFail({
			resourceId,
		});

		const queueAttributesCommand = new GetQueueAttributesCommand({
			QueueUrl: sqs.queueUrl,
			AttributeNames: ['All'],
		});
		const queueAttributes = await client.send(queueAttributesCommand);

		return {
			name: sqs.queueUrl,
			arn: queueAttributes.Attributes['QueueArn'],
			messages: queueAttributes.Attributes['ApproximateNumberOfMessages'],
			notVisibleMessages:
				queueAttributes.Attributes[
					'ApproximateNumberOfMessagesNotVisible'
				],
			delayedMessages:
				queueAttributes.Attributes[
					'ApproximateNumberOfMessagesDelayed'
				],
			visibilityTimeout: queueAttributes.Attributes['VisibilityTimeout'],
			maxMessageSize: queueAttributes.Attributes['MaximumMessageSize'],
			messageRetentionPeriod:
				queueAttributes.Attributes['MessageRetentionPeriod'],
			delay: queueAttributes.Attributes['DelaySeconds'],
			recievedMessageWaitTime:
				queueAttributes.Attributes['ReceiveMessageWaitTimeSeconds'],
			managedSseEnabled:
				queueAttributes.Attributes['SqsManagedSseEnabled'],
			created: new Date(
				Number(queueAttributes.Attributes['CreatedTimestamp']) * 1000,
			).toISOString(),
			updated: new Date(
				Number(queueAttributes.Attributes['LastModifiedTimestamp']) *
					1000,
			).toISOString(),
		};
	}

	async getStatus(credentials: AWSCredentials, resourceId: string) {
		const client = this.connect(credentials);
		const sqs = await this.sqsRepository.findOneOrFail({
			resourceId,
		});

		try {
			const queueAttributesCommand = new GetQueueAttributesCommand({
				QueueUrl: sqs.queueUrl,
			});
			await client.send(queueAttributesCommand);
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
		input: CreateQueueDTO,
	) {
		const client = this.connect(credentials);
		const sqs = this.sqsRepository.create({
			resourceId,
			queueUrl: input.name,
		});
		wrap(sqs);

		const command = new CreateQueueCommand({
			QueueName: input.name,
			Attributes: {
				DelaySeconds: this.toString(input.delay),
				MaximumMessageSize: this.toString(input.maxMessageSize),
				MessageRetentionPeriod: this.toString(
					input.messageRetentionPeriod,
				),
				Policy: this.toString(input.policy),
				ReceiveMessageWaitTimeSeconds: this.toString(
					input.receiveMessageWaitTime,
				),
				RedrivePolicy:
					input.maxReceiveCount && input.deadLetterTargetArn
						? JSON.stringify({
								deadLetterTargetArn: input.deadLetterTargetArn,
								maxReceiveCount: this.toString(
									input.maxReceiveCount,
								),
						  })
						: undefined,
				VisibilityTimeout: this.toString(input.visibilityTimeout),
				FifoQueue: this.toString(input.fifo),
			},
		});

		const response = await client.send(command);
		await this.sqsRepository.persistAndFlush(sqs);

		return !!response.QueueUrl;
	}

	async update(
		credentials: AWSCredentials,
		resourceId: string,
		input: UpdateQueueDTO,
	) {
		const client = this.connect(credentials);
		const sqs = await this.sqsRepository.findOneOrFail({
			resourceId,
		});

		const command = new SetQueueAttributesCommand({
			QueueUrl: sqs.queueUrl,
			Attributes: {
				DelaySeconds: this.toString(input.delay),
				MaximumMessageSize: this.toString(input.maxMessageSize),
				MessageRetentionPeriod: this.toString(
					input.messageRetentionPeriod,
				),
				Policy: this.toString(input.policy),
				ReceiveMessageWaitTimeSeconds: this.toString(
					input.receiveMessageWaitTime,
				),
				deadLetterTargetArn: input.deadLetterTargetArn,
				maxReceiveCount: this.toString(input.maxReceiveCount),
				VisibilityTimeout: this.toString(input.visibilityTimeout),
			},
		});

		const response = await client.send(command);
		return !!response;
	}

	async delete(credentials: AWSCredentials, resourceId: string) {
		const client = this.connect(credentials);
		const sqs = await this.sqsRepository.findOneOrFail({
			resourceId,
		});

		const command = new DeleteQueueCommand({
			QueueUrl: sqs.queueUrl,
		});

		const response = await client.send(command);
		await this.sqsRepository.removeAndFlush(sqs);

		return !!response;
	}

	private connect(credentials: AWSCredentials): SQSClient {
		return new SQSClient({
			region: credentials.region,
			credentials: {
				accessKeyId: credentials.id,
				secretAccessKey: credentials.secret,
			},
		});
	}

	private toString(value?: number | boolean | object): string | undefined {
		if (value === undefined) return undefined;
		if (typeof value === 'boolean') return String(value);
		if (typeof value === 'object') return JSON.stringify(value);
		return String(value);
	}
}
