import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { PetService } from './pet.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('pet')
export class PetController {
  constructor(private readonly petService: PetService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() createPetDto: CreatePetDto) {
    try {
      const user = req.user;
      return await this.petService.create(user, createPetDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    try {
      return await this.petService.findAll();
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
