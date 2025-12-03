import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderService } from 'src/order/order.service';
import { CustomerService } from 'src/customer/customer.service';

@Module({
  controllers: [AppointmentController],
  providers: [AppointmentService,PrismaService,OrderService,CustomerService],
})
export class AppointmentModule {}
