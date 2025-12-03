import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpException, HttpStatus } from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { STAFF } from 'src/common/decorators/staff.decorator';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) { }

  // @Post()
  // create(@Body() createStaffDto: CreateStaffDto) {
  //   return this.staffService.create(createStaffDto);
  // }
  @STAFF()
  @Get()
    async findAll(
      @Query('page') page = '1',
      @Query('limit') limit = '10',
      @Query('search') search?: string,
      @Query('sort') sort: 'asc' | 'desc' = 'desc',
    ) {
      try {
        return await this.staffService.findAll({
          page: Number(page),
          limit: Number(limit),
          search,
          sort,
        });
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

  // @Get()
  // findAll() {
  //   return this.staffService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.staffService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
  //   return this.staffService.update(+id, updateStaffDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.staffService.remove(+id);
  // }
}
