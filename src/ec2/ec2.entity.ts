import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({
	tableName: 'instances',
})
export class EC2 {
	@PrimaryKey()
	resourceId: string;

	@Property()
	instanceId: string;
}
