import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { STAFF } from 'src/common/decorators/staff.decorator';

@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) { }

  // @UseGuards(JwtAuthGuard)
  @STAFF()
  @Post()
  async createStaff(@Body(new ValidationPipe()) body: CreateBranchDto) {
    try {
      return await this.branchService.create(body);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @Get()
  // findAll() {
  //   return this.branchService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.branchService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto) {
  //   return this.branchService.update(+id, updateBranchDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.branchService.remove(+id);
  // }
}
