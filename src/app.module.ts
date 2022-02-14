import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { S3Module } from './s3/s3.module';
import { MainController } from './main.controller';

@Module({
  imports: [S3Module],
  controllers: [AppController, MainController],
  providers: [AppService],
})
export class AppModule {}
