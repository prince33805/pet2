import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { Admin } from 'src/common/decorators/admin.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) { }

  // @Admin()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() createServiceDto: CreateServiceDto) {
    try {
      const user = req.user;
      return await this.serviceService.create(user, createServiceDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    try {
      return await this.serviceService.findAll();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @Get(':id')
  // async findOne(@Param('id') id: string) {
  //   try {
  //     return await this.serviceService.findOne(+id);
  //   } catch (error) {
  //     throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  // @Patch(':id')
  // async update(@Param('id') id: string, @Body() updateServiceDto: CreateServiceDto) {
  //   try {
  //     return await this.serviceService.update(+id, updateServiceDto);
  //   } catch (error) {
  //     throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  // @Delete(':id')
  // async remove(@Param('id') id: string) {
  //   try {
  //     return await this.serviceService.remove(+id);
  //   } catch (error) {
  //     throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }
}
