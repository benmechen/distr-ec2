import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({
	tableName: 'buckets',
})
export class S3 {
	@PrimaryKey()
	resourceId: string;

	@Property()
	name: string;
}
