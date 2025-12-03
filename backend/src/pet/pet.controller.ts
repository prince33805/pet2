import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, UseGuards, Req, Query } from '@nestjs/common';
import { PetService } from './pet.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { STAFF } from 'src/common/decorators/staff.decorator';

@Controller('pet')
export class PetController {
  constructor(private readonly petService: PetService) { }

  // @Post('upload-url')
  // async getUploadUrl(@Req() req, @Body() body: { filename: string; contentType: string; customerId: string }) {
  //   // TODO: validate contentType (image/jpeg|png|webp)
  //   return this.petService.getUploadUrl(req.user, body);
  // }

  // @UseGuards(JwtAuthGuard)
  @STAFF()
  @Post()
  async create(@Req() req: any, @Body() createPetDto: CreatePetDto) {
    try {
      const user = req.user;
      return await this.petService.create(user, createPetDto);
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
      return await this.petService.findAll({
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
      return await this.petService.findOne(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.petService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePetDto: UpdatePetDto) {
  //   return this.petService.update(+id, updatePetDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.petService.remove(+id);
  // }
}
