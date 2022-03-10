import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { SmallUbuntuController } from './small-ubuntu.controller';

@Module({
	imports: [SharedModule],
	controllers: [SmallUbuntuController],
})
export class SmallUbuntuModule {}
