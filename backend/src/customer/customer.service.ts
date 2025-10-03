import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomerService {
  constructor(
    private prisma: PrismaService,
  ) { }
  // create(createCustomerDto: CreateCustomerDto) {
  //   return 'This action adds a new customer';
  // }

  // findAll() {
  //   return `This action returns all customer`;
  // }

  async findOne(user: any, id: string) {
    try {
      if (user.id !== id) {
        throw new ConflictException('You are not authorized to access this profile');
      }
      const profile = await this.prisma.customer.findUnique({
        where: { id: id },
      });
      if (!profile) {
        throw new ConflictException('User not found');
      }
      return profile
    } catch (error) {
      throw new HttpException(`Database query failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAllByCustomer(user: any, id: string){
    try {
      const customer = await this.prisma.customer.findUnique({
        where: { id: user.id },
      });
      if (!customer) {
        throw new ConflictException('User not found');
      }
      if(customer.id !== id){
        throw new ConflictException('You are not authorized to view this customer\'s pets');
      }
      return await this.prisma.pet.findMany({
        where: { customerId: id },
      });
    } catch (error) {
      throw new HttpException(`Database query failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // update(id: number, updateCustomerDto: UpdateCustomerDto) {
  //   return `This action updates a #${id} customer`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} customer`;
  // }
}
