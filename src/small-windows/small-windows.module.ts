import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { SmallWindowsController } from './small-windows.controller';

@Module({
	imports: [SharedModule],
	controllers: [SmallWindowsController],
})
export class SmallWindowsModule {}
