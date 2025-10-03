import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, HttpException, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Admin } from 'src/common/decorators/admin.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  // @Post()
  // create(@Body() createCustomerDto: CreateCustomerDto) {
  //   return this.customerService.create(createCustomerDto);
  // }

  // @Get()
  // findAll() {
  //   return this.customerService.findAll();
  // }

  // @Admin()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    try {
      const user = req.user;
      return await this.customerService.findOne(user, id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/pets')
  async findAllByCustomer(@Req() req: any, @Param('id') id: string) {
    try {
      const user = req.user;
      return await this.customerService.findAllByCustomer(user, id);
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
