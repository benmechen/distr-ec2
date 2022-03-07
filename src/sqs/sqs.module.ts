import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { SQS } from './sqs.entity';
import { SqsService } from './sqs.service';

@Module({
	imports: [MikroOrmModule.forFeature([SQS])],
	providers: [SqsService],
	exports: [SqsService],
})
export class SqsModule {}
