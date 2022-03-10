// import { Module } from '@nestjs/common';
// import { AppController } from './shared/app.controller';
// import { HelperService } from './helper/helper.service';
// import { MikroOrmModule } from '@mikro-orm/nestjs';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { DBConfig } from './db.config';
// import { Ec2Module } from './ec2/ec2.module';
// import { SmallUbuntuModule } from './small-ubuntu/small-ubuntu.module';
// import { MediumUbuntuModule } from './medium-ubuntu/medium-ubuntu.module';
// import { LargeUbuntuModule } from './large-ubuntu/large-ubuntu.module';
// import { MacModule } from './mac/mac.module';
// import { SmallWindowsModule } from './small-windows/small-windows.module';
// import { MediumWindowsModule } from './medium-windows/medium-windows.module';
// import { LargeWindowsModule } from './large-windows/large-windows.module';
// import { SharedModule } from './shared/shared.module';

// @Module({
// 	imports: [
// 		ConfigModule.forRoot({
// 			isGlobal: true,
// 		}),
// 		MikroOrmModule.forRootAsync({
// 			imports: [ConfigModule],
// 			useClass: DBConfig,
// 			inject: [ConfigService],
// 		}),
// 		Ec2Module,
// 		SmallUbuntuModule,
// 		MediumUbuntuModule,
// 		LargeUbuntuModule,
// 		MacModule,
// 		SmallWindowsModule,
// 		MediumWindowsModule,
// 		LargeWindowsModule,
// 		SharedModule,
// 	],
// 	controllers: [AppController],
// 	providers: [HelperService],
// })
// export class AppModule {}
