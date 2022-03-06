import {
	IsAscii,
	IsIn,
	IsOptional,
	MaxLength,
	MinLength,
} from 'class-validator';

export class CreateBucketDTO {
	@MinLength(3)
	@MaxLength(63)
	@IsAscii()
	name: string;

	@IsOptional()
	@IsIn(
		['private', 'public-read', 'public-read-write', 'authenticated-read'],
		{
			message:
				'ACL must be one of: private, public-read, public-read-write, authenticated-read',
		},
	)
	access?:
		| 'private'
		| 'public-read'
		| 'public-read-write'
		| 'authenticated-read';
}
