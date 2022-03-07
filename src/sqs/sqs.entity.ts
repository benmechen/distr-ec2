import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({
	tableName: 'queues',
})
export class SQS {
	@PrimaryKey()
	resourceId: string;

	@Property()
	queueUrl: string;
}
