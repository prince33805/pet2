import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, HttpException, HttpStatus, UseGuards, Req, Query } from '@nestjs/common';
import { CustomerService } from './customer.service';
// import { Admin } from 'src/common/decorators/staff.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { STAFF } from 'src/common/decorators/staff.decorator';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  // @Post()
  // create(@Body() createCustomerDto: CreateCustomerDto) {
  //   return this.customerService.create(createCustomerDto);
  // }

  // @UseGuards(JwtAuthGuard)
  @STAFF()
  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
    @Query('sort') sort: 'asc' | 'desc' = 'desc',
  ) {
    try {
      return await this.customerService.findAll({
        page: Number(page),
        limit: Number(limit),
        search,
        sort,
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @Admin()
  // @UseGuards(JwtAuthGuard)
  @STAFF()
  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    try {
      const user = req.user;
      return await this.customerService.findOne(user, id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @UseGuards(JwtAuthGuard)
  @STAFF()
  @Get(':id/appointment')
  async findAllAppointmentsByCustomerIdWithPagination(@Req() req: any, @Param('id') id: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('sort') sort: 'asc' | 'desc' = 'desc',) {
    try {
      const user = req.user;
      return await this.customerService.findAllAppointmentsByCustomerIdWithPagination(user, id, {
        page: Number(page),
        limit: Number(limit),
        status,
        search,
        sort,
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
  //   return this.customerService.update(+id, updateCustomerDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.customerService.remove(+id);
  // }
}
