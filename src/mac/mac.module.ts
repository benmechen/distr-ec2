import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { MacController } from './mac.controller';

@Module({
	imports: [SharedModule],
	controllers: [MacController],
})
export class MacModule {}
