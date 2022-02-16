import { CreateBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { AWSCredentials } from '../generated/co/mechen/distr/common/v1';
import { CreateBucketDTO } from './dto/create-bucket.dto';

@Injectable()
export class S3Service {
	constructor() {}

	async create(credentials: AWSCredentials, input: CreateBucketDTO) {
		const client = this.connect(credentials);
		const command = new CreateBucketCommand({
			Bucket: input.name,
			ACL: input.access,
			CreateBucketConfiguration: {
				LocationConstraint: credentials.region,
			},
		});
		const response = await client.send(command);
		return !!response.Location;
	}

	private connect(credentials: AWSCredentials): S3Client {
		return new S3Client({
			region: credentials.region,
			credentials: {
				accessKeyId: credentials.id,
				secretAccessKey: credentials.secret,
			},
		});
	}
}
