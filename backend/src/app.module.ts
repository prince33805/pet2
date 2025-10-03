import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { PetModule } from './pet/pet.module';
import { ServiceModule } from './service/service.module';
import { AppointmentModule } from './appointment/appointment.module';
import { OrderModule } from './order/order.module';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [AuthModule, CustomerModule, PetModule, ServiceModule, AppointmentModule, OrderModule, ReviewModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
