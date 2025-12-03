import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomerService {
  constructor(
    private prisma: PrismaService,
    // private logger: Logger
  ) { }
  // create(createCustomerDto: CreateCustomerDto) {
  //   return 'This action adds a new customer';
  // }

  // find all customers with pagination
  async findAll(params: { page?: number; limit?: number; search?: string; sort?: 'asc' | 'desc'; }) {
    try {
      const { page = 1, limit = 1, search, sort = 'desc' } = params;
      const where: any = {};
      if (search) {
        where.OR = [
          { username: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ];
      }
      const totalCount = await this.prisma.customer.count({ where });
      const customers = await this.prisma.customer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: sort },
        include: {
          pets: true,
        }
      });
      return {
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
        customers,
      };
    } catch (error) {
      throw new HttpException(`Database query failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(user: any, id: string) {
    try {
      // if (user.id !== id) {
      //   throw new ConflictException('You are not authorized to access this profile');
      // }
      //find customer profile with pets
      const customer = await this.prisma.customer.findUnique({
        where: { id: id },
        include: {
          pets: true,
        },
      });
      if (!customer) {
        throw new ConflictException('User not found');
      }
      return customer;
    } catch (error) {
      throw new HttpException(`Database query failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAllAppointmentsByCustomerIdWithPagination(
    user: any,
    customerId: string,
    params: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
      sort?: 'asc' | 'desc';
    },
  ) {
    const { page = 1, limit = 10, status, search, sort = 'desc' } = params;

    if (user.id !== customerId) {
      throw new ConflictException('You are not authorized to access this profile');
    }

    // ตรวจสอบว่าลูกค้ามีอยู่จริง
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true },
    });
    if (!customer) {
      throw new HttpException(
        `Customer with ID ${customerId} not found`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // เงื่อนไขการค้นหา
    const where: any = {
      customerId,
    };

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { pet: { name: { contains: search, mode: 'insensitive' } } },
        { appointmentService: { some: { service: { name: { contains: search, mode: 'insensitive' } } } } },
      ];
    }

    // นับจำนวนทั้งหมดเพื่อคำนวณ pagination
    const totalCount = await this.prisma.appointment.count({ where });

    // ดึงข้อมูลพร้อม relation
    const appointments = await this.prisma.appointment.findMany({
      where,
      include: {
        pet: true,
        order: true,
        appointmentService: {
          include: {
            service: true,
            appointmentServiceOption: {
              include: { option: true },
            },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: sort },
    });

    // แปลงข้อมูลสำหรับ response (optional)
    const data = appointments.map((a) => ({
      id: a.id,
      petName: a.pet?.name,
      dateTime: a.dateTime,
      status: a.status,
      orderId: a.orderId,
      totalAmount: a.order?.amount ?? 0,
      services: a.appointmentService.map((s) => ({
        serviceName: s.service.name,
        servicePrice: s.priceAtBooking,
        options: s.appointmentServiceOption.map((o) => ({
          optionName: o.option.name,
          optionPrice: o.priceAtBooking,
        })),
      })),
    }));

    return {
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      appointments,
    };
  }

  // async addPoints(input: { customerId: string; orderId: string; amount: Prisma.Decimal; actorUserId?: string; reason: string; }) {
  //   // ตัวอย่าง rule: 1% กรอกใน config/table ก็ได้
  //   const points = input.amount.div(new Prisma.Decimal(100)).toDecimalPlaces(2);
  //   const customer = await this.prisma.customer.findUnique({
  //     where: { id: input.customerId },
  //   });
  //   if (!customer) {
  //     throw new HttpException(`Customer with ID ${input.customerId} not found`, HttpStatus.BAD_REQUEST);
  //   }
  //   const updatedPoints = customer.totalPoints.toNumber() + points.toNumber();
  //   await this.prisma.customer.update({
  //     where: { id: input.customerId },
  //     data: { totalPoints: new Prisma.Decimal(updatedPoints) },
  //   });

  //   // await this.prisma.$transaction(async (tx) => {
  //   //   await tx.customerPointsLedger.create({
  //   //     data: {
  //   //       customerId: input.customerId,
  //   //       orderId: input.orderId,
  //   //       delta: points,
  //   //       reason: input.reason,
  //   //       createdBy: input.actorUserId ?? null,
  //   //     },
  //   //   });
  //   //   await tx.customer.update({
  //   //     where: { id: input.customerId },
  //   //     data: { totalPoints: { increment: points } },
  //   //   });
  //   // });
  // }

  // update(id: number, updateCustomerDto: UpdateCustomerDto) {
  //   return `This action updates a #${id} customer`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} customer`;
  // }
}
