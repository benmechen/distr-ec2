import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { MediumUbuntuController } from './medium-ubuntu.controller';

@Module({
	imports: [SharedModule],
	controllers: [MediumUbuntuController],
})
export class MediumUbuntuModule {}
