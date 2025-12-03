import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { PetModule } from './pet/pet.module';
import { ServiceModule } from './service/service.module';
import { AppointmentModule } from './appointment/appointment.module';
import { OrderModule } from './order/order.module';
import { ReviewModule } from './review/review.module';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { BranchModule } from './branch/branch.module';
import { StaffModule } from './staff/staff.module';
import { SlotModule } from './slot/slot.module';

@Module({
  imports: [
    AuthModule,
    CustomerModule,
    PetModule,
    ServiceModule,
    AppointmentModule,
    OrderModule,
    ReviewModule,
    BranchModule,
    StaffModule,
    SlotModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
