import { IsIn, IsOptional } from 'class-validator';

export class UpdateBucketDTO {
	@IsOptional()
	@IsIn(['private', 'public-read', 'public-read-write', 'authenticated-read'])
	access?:
		| 'private'
		| 'public-read'
		| 'public-read-write'
		| 'authenticated-read';
}
