import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { LargeUbuntuModule } from './large-ubuntu/large-ubuntu.module';
import { LargeWindowsModule } from './large-windows/large-windows.module';
import { MacModule } from './mac/mac.module';
import { MediumUbuntuModule } from './medium-ubuntu/medium-ubuntu.module';
import { MediumWindowsModule } from './medium-windows/medium-windows.module';
import { SmallUbuntuModule } from './small-ubuntu/small-ubuntu.module';
import { SmallWindowsModule } from './small-windows/small-windows.module';

async function bootstrap() {
	const buildApp = async (
		module: any,
		ports: {
			web: number;
			grpc: number;
		},
	) => {
		const app = await NestFactory.create(module);

		app.connectMicroservice<MicroserviceOptions>({
			transport: Transport.GRPC,
			options: {
				package: 'sqs',
				protoPath: join(__dirname, '../../protos/main.proto'),
				url: `0.0.0.0:${ports.grpc}`,
			},
		});

		app.useGlobalPipes(new ValidationPipe());

		await app.startAllMicroservices();
		await app.listen(ports.web);

		// eslint-disable-next-line
		console.log(`🚀 ${module.name} server ready on port ${ports.web}`);
	};

	await buildApp(SmallUbuntuModule, {
		web: 4004,
		grpc: 50054,
	});
	await buildApp(MediumUbuntuModule, {
		web: 4005,
		grpc: 50055,
	});
	await buildApp(LargeUbuntuModule, {
		web: 4006,
		grpc: 50056,
	});
	await buildApp(SmallWindowsModule, {
		web: 4007,
		grpc: 50057,
	});
	await buildApp(MediumWindowsModule, {
		web: 4008,
		grpc: 50058,
	});
	await buildApp(LargeWindowsModule, {
		web: 4009,
		grpc: 50059,
	});
	await buildApp(MacModule, {
		web: 4010,
		grpc: 50060,
	});
}
bootstrap();
