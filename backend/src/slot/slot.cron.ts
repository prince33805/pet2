// src/slot/slot.cron.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SlotService } from './slot.service';
import * as dayjs from 'dayjs';

@Injectable()
export class SlotCron {
  private readonly logger = new Logger(SlotCron.name);
  constructor(private readonly slotService: SlotService) {}

  @Cron('0 1 1 * *', { timeZone: 'Asia/Bangkok' })
  async handleCron() {
    const start = dayjs().format('YYYY-MM-DD');
    this.logger.log(`Generating slots for next 30 days from ${start}`);
    await this.slotService.preGenerate30Days(start);
    this.logger.log('Slot generation completed');
  }
}
