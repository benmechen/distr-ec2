import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { MediumWindowsController } from './medium-windows.controller';

@Module({
	imports: [SharedModule],
	controllers: [MediumWindowsController],
})
export class MediumWindowsModule {}
