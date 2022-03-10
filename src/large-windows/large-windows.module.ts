import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { LargeWindowsController } from './large-windows.controller';

@Module({
	imports: [SharedModule],
	controllers: [LargeWindowsController],
})
export class LargeWindowsModule {}
