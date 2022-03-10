import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { LargeUbuntuController } from './large-ubuntu.controller';

@Module({
	imports: [SharedModule],
	controllers: [LargeUbuntuController],
})
export class LargeUbuntuModule {}
