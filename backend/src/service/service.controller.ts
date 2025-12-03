import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, UseGuards, Req, Query } from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { STAFF } from 'src/common/decorators/staff.decorator';
// import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) { }

  // @Admin()
  // @UseGuards(JwtAuthGuard)
  @STAFF()
  @Post()
  async create(@Req() req: any, @Body() createServiceDto: CreateServiceDto) {
    try {
      const user = req.user;
      return await this.serviceService.create(user, createServiceDto);
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
    @Query('sort') sort: 'asc' | 'desc' = 'desc',
  ) {
    try {
      return await this.serviceService.findAll({
        page: Number(page),
        limit: Number(limit),
        search,
        sort,
      });
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
