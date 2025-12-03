import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StaffService {
  constructor(
    private prisma: PrismaService,
    // private logger: Logger
  ) { }
  
  // create(createStaffDto: CreateStaffDto) {
  //   return 'This action adds a new staff';
  // }

  async findAll(params: { page?: number; limit?: number; search?: string; sort?: 'asc' | 'desc'; }) {
    try {
      const { page = 1, limit = 1, search, sort = 'desc' } = params;
      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { role: { contains: search, mode: 'insensitive' } },
        ];
      }
      const totalCount = await this.prisma.staff.count({ where });
      const staffs = await this.prisma.staff.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: sort },
      });
      return {
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
        staffs,
      };
    } catch (error) {
      throw new HttpException(`Database query failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} staff`;
  // }

  // update(id: number, updateStaffDto: UpdateStaffDto) {
  //   return `This action updates a #${id} staff`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} staff`;
  // }
}
