import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
			protoPath: join(__dirname, '../../protos/main.proto'),
			url: 'localhost:50052',
		},
	});

	app.useGlobalPipes(new ValidationPipe());
	const configService = app.get(ConfigService);

	await app.startAllMicroservices();

	const port = configService.get('PORT') ?? 4001;
	await app.listen(port);
	// eslint-disable-next-line
	console.log(`🚀 Server ready on port ${port}`);
}
bootstrap();
