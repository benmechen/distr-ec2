import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { S3 } from './s3.entity';
import { S3Service } from './s3.service';

@Module({
	imports: [MikroOrmModule.forFeature([S3])],
	providers: [S3Service],
	exports: [S3Service],
})
export class S3Module {}
