import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpException, HttpStatus, Query } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
// import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { OrderPayloadDto } from './dto/order-payload.dto';
import { STAFF } from 'src/common/decorators/staff.decorator';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) { }

  // @UseGuards(JwtAuthGuard)
  @STAFF()
  @Post()
  async create(@Req() req: any, @Body() body: OrderPayloadDto) {
    try {
      const user = req.user;
      console.log("body",body)
      // return await this.appointmentService.create(user, createAppointmentDto);
      return await this.appointmentService.createOrderWithAppointments(user, body);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @UseGuards(JwtAuthGuard)
  @STAFF()
  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
    @Query('sort') sort: 'asc' | 'desc' = 'desc',) {
    try {
      return await this.appointmentService.findAll({
        page: Number(page),
        limit: Number(limit),
        search,
        sort,
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @UseGuards(JwtAuthGuard)
  @STAFF()
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
