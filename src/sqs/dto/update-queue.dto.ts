import { IsOptional, Max, Min } from 'class-validator';

export class UpdateQueueDTO {
	@Min(0)
	@Max(900)
	@IsOptional()
	delay?: number;

	@Min(1024)
	@Max(262144)
	@IsOptional()
	maxMessageSize?: number;

	@Min(60)
	@Max(1209600)
	@IsOptional()
	messageRetentionPeriod?: number;

	policy?: Record<string, any>;

	@Min(0)
	@Max(20)
	@IsOptional()
	receiveMessageWaitTime?: number;

	deadLetterTargetArn?: string;

	maxReceiveCount?: number;

	@Min(0)
	@Max(43200)
	@IsOptional()
	visibilityTimeout?: number;
}
