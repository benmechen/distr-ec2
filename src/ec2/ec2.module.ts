import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { HelperService } from '../shared/helper/helper.service';
import { EC2 } from './ec2.entity';
import { Ec2Service } from './ec2.service';

@Module({
	imports: [MikroOrmModule.forFeature([EC2])],
	providers: [HelperService, Ec2Service],
	exports: [Ec2Service],
})
export class Ec2Module {}
