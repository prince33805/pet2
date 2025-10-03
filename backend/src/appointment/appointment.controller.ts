import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() createAppointmentDto: CreateAppointmentDto) {
    try {
      const user = req.user;
      return await this.appointmentService.create(user, createAppointmentDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    try {
      return await this.appointmentService.findAll();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.appointmentService.findOne(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() createAppointmentDto: CreateAppointmentDto) {
  //   return this.appointmentService.update(+id, createAppointmentDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.appointmentService.remove(+id);
  // }
}
