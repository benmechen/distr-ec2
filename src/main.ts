import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 's3',
      protoPath: join(__dirname, '../protos/main.proto'),
      url: 'localhost:50052',
    },
  });

  await app.startAllMicroservices();
  await app.listen(4001);
}
bootstrap();
