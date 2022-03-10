import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { DBConfig } from '../db.config';
import { Ec2Module } from '../ec2/ec2.module';
import { HelperService } from './helper/helper.service';
import { MainController } from '../main.controller';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		MikroOrmModule.forRootAsync({
			imports: [ConfigModule],
			useClass: DBConfig,
			inject: [ConfigService],
		}),
		Ec2Module,
	],
	providers: [HelperService, MainController],
	controllers: [AppController],
	exports: [Ec2Module, HelperService, MainController],
})
export class SharedModule {}
