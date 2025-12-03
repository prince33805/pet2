import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) { }

  // async create(user: any, createOrderDto: CreateOrderDto) {
  //   try {

  //     const appointment = await this.prisma.appointment.findUnique({
  //       where: { id: createOrderDto.appointmentId.toString() },
  //       include: {
  //         appointmentService: {
  //           include: {
  //             service: true, // ข้อมูล Service
  //             appointmentServiceOption: {
  //               include: { option: true } // ข้อมูล Option ที่เลือกจริง ๆ
  //             }
  //           }
  //         }
  //       }
  //     });

  //     if (!appointment) {
  //       throw new HttpException(`Appointment with ID ${createOrderDto.appointmentId} not found`, HttpStatus.BAD_REQUEST);
  //     }

  //     // Calculate total price from appointment services and their options
  //     let totalPrice = 0;
  //     for (const appService of appointment.appointmentService) {
  //       totalPrice += appService.service.price;
  //       for (const appServiceOption of appService.appointmentServiceOption) {
  //         totalPrice += appServiceOption.option.price;
  //       }
  //     }

  //     const newOrder = await this.prisma.order.create({
  //       data: {
  //         appointmentId: createOrderDto.appointmentId.toString(),
  //         amount: totalPrice,
  //         method: 'CASH',
  //         status: 'PENDING',
  //         createdBy: user.id,
  //         updatedBy: user.id
  //       },
  //     });

  //     // update customer totalPoints
  //     const customer = await this.prisma.customer.findUnique({
  //       where: { id: appointment.customerId },
  //     });
  //     if (!customer) {
  //       throw new HttpException(`Customer with ID ${appointment.customerId} not found`, HttpStatus.BAD_REQUEST);
  //     }
  //     const updatedPoints = customer.totalPoints + Number((totalPrice/100).toFixed(2));
  //     await this.prisma.customer.update({
  //       where: { id: appointment.customerId },
  //       data: { totalPoints: updatedPoints },
  //     });

  //     return newOrder;
  //   } catch (error) {
  //     throw new HttpException(`Database query failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  // findAll() {
  //   return `This action returns all order`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} order`;
  // }

  // update(id: number, updateOrderDto: CreateOrderDto) {
  //   return `This action updates a #${id} order`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} order`;
  // }
}
