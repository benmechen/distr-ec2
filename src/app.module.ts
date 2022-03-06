import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { S3Module } from './s3/s3.module';
import { MainController } from './main.controller';
import { HelperService } from './helper/helper.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DBConfig } from './db.config';

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
		S3Module,
	],
	controllers: [AppController, MainController],
	providers: [AppService, HelperService],
})
export class AppModule {}
