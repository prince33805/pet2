import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) { }

  async create(user: any, createServiceDto: CreateServiceDto) {
    try {
      const serviceWithOptions = await this.prisma.$transaction(async (prisma) => {
        const service = await prisma.service.create({
          data: {
            name: createServiceDto.name,
            description: createServiceDto.description,
            duration: createServiceDto.duration,
            price: createServiceDto.price,
            createdBy: user.id,
            updatedBy: user.id
          },
        });

        const optionServices = await Promise.all(
          createServiceDto.optionService.map(async (option) => {
            return await prisma.option.create({
              data: {
                name: option.name,
                description: option.description,
                price: option.price,
                serviceId: service.id,
                createdBy: user.id,
                updatedBy: user.id
              },
            });
          })
        );

        return { ...service, optionService: optionServices };
      });

      return serviceWithOptions;
    } catch (error) {
      throw new HttpException(`Database query failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll() {
    try {
      return await this.prisma.service.findMany({
        include: {
          options: true,
        },
      }); 
    } catch (error) {
      throw new HttpException(`Database query failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // async findOne(id: number) {
  //   try {
  //     return `This action returns a #${id} service`;
  //   } catch (error) {
  //     throw new HttpException(`Database query failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  // async update(id: number, updateServiceDto: CreateServiceDto) {
  //   try {
  //     return `This action updates a #${id} service`;
  //   } catch (error) {
  //     throw new HttpException(`Database query failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  // async remove(id: number) {
  //   try {
  //     return `This action removes a #${id} service`;
  //   } catch (error) {
  //     throw new HttpException(`Database query failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }
}
