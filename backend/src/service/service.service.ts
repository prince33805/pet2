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

        // check if createServiceDto.optionService is empty or not
        if (!createServiceDto.options || createServiceDto.options.length === 0) {
          return service;
        }
        const optionServices = await Promise.all(
          createServiceDto.options.map(async (option) => {
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

  async findAll(params: { page?: number; limit?: number; search?: string; sort?: 'asc' | 'desc'; }) {
    try {
      const { page = 1, limit, search, sort = 'asc' } = params;
      console.log("param", params)
      const skip = limit ? (page - 1) * limit : undefined;
      const take = limit || undefined;
      const order: any = { createdAt: sort === 'desc' ? 'desc' : 'asc' };
      const where: any = {};
      if (search && search.trim() !== '') {
        const q = search.trim();
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { options: { some: { name: { contains: q, mode: 'insensitive' } } } }
        ];
      }
      console.log("sort", sort)
      const [totalCount, services] = await this.prisma.$transaction([
        this.prisma.service.count({ where }),
        this.prisma.service.findMany({
          where,
          skip,
          take,
          orderBy: order,
          include: {
            options: true,
          },
        }),
      ]);

      const totalPages = limit ? Math.ceil(totalCount / limit) : 1;
      return {
        pagination: {
          page: limit ? page : 1,
          limit: limit ?? null,
          totalCount,
          totalPages,
        },
        services,
      }
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
