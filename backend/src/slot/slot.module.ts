import { Module } from '@nestjs/common';
import { SlotService } from './slot.service';
import { SlotController } from './slot.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { SlotCron } from './slot.cron';

@Module({
  controllers: [SlotController],
  providers: [SlotCron,SlotService,PrismaService],
})
export class SlotModule {}
