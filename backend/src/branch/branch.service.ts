import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BranchService {
  constructor(
    private prisma: PrismaService,
  ) { }
  async create(CreateBranchDto: CreateBranchDto) {
    try {
      //create branch
      const branch = await this.prisma.branch.create({
        data: {
          ...CreateBranchDto,
        },
      });
      return branch;
    } catch (error) {
      throw new HttpException(`Database create failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // findAll() {
  //   return `This action returns all branch`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} branch`;
  // }

  // update(id: number, updateBranchDto: UpdateBranchDto) {
  //   return `This action updates a #${id} branch`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} branch`;
  // }
}
