import { IsAscii, IsIn, MaxLength, MinLength } from 'class-validator';

export class CreateBucketDTO {
	@MinLength(3)
	@MaxLength(63)
	@IsAscii()
	name: string;

	@IsIn(['private', 'public-read', 'public-read-write', 'authenticated-read'])
	access:
		| 'private'
		| 'public-read'
		| 'public-read-write'
		| 'authenticated-read';
}
