import { ConflictException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePetDto } from './dto/create-pet.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PetService {
  constructor(
    private prisma: PrismaService,
  ) { }
  async create(user: any, createPetDto: CreatePetDto) {
    try {
      const customer = await this.prisma.customer.findUnique({
        where: { id: user.id },
      });
      if (!customer) {
        throw new ConflictException('User not found');
      }
      const pets = await this.prisma.pet.findFirst({
        where: { name: createPetDto.name , customerId: customer.id},
      });
      if (pets) {
        throw new ConflictException('Pet name already exists');
      }
      const pet = await this.prisma.pet.create({
        data: {
          customerId: customer.id,
          ...createPetDto,
          gender: createPetDto.gender as any,
          createdBy: user.id,
          updatedBy: user.id,
        },
      });
      return pet;
    } catch (error) {
      throw new HttpException(`Database query failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll() {
    try {
      return await this.prisma.pet.findMany();
    } catch (error) {
      throw new HttpException(`Database query failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} pet`;
  // }

  // update(id: number, updatePetDto: UpdatePetDto) {
  //   return `This action updates a #${id} pet`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} pet`;
  // }
}
