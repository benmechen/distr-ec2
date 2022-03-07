import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MainController } from './main.controller';
import { HelperService } from './helper/helper.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DBConfig } from './db.config';
import { SqsModule } from './sqs/sqs.module';

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
		SqsModule,
	],
	controllers: [AppController, MainController],
	providers: [AppService, HelperService],
})
export class AppModule {}
