import { Controller, Get, Query } from '@nestjs/common';
import { SlotService } from './slot.service';

@Controller('slots')
export class SlotController {
  constructor(private readonly slotService: SlotService) { }

  @Get('generate')
  async generate(@Query('start') start: string) {
    return this.slotService.preGenerate30Days(start);
  }

  @Get('availability')
  async availability(@Query('date') date: string) {
    const slots = await this.slotService.availability(date);
    return slots;
  }
}
