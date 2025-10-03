import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderService } from 'src/order/order.service';

@Injectable()
export class AppointmentService {
  constructor(
    private prisma: PrismaService,
    private orderService: OrderService
  ) { }

  async create(user: any, createAppointmentDto: CreateAppointmentDto) {
    try {

      const newAppointment = await this.prisma.$transaction(async (prisma) => {
        const customer = await prisma.customer.findUnique({
          where: { id: createAppointmentDto.customerId },
        });
        if (!customer) {
          throw new HttpException(`Customer with ID ${createAppointmentDto.customerId} not found`, HttpStatus.BAD_REQUEST);
        }
        const pet = await prisma.pet.findUnique({
          where: { id: createAppointmentDto.petId },
        });
        if (!pet) {
          throw new HttpException(`Pet with ID ${createAppointmentDto.petId} not found`, HttpStatus.BAD_REQUEST);
        }
        // const staff = await prisma.staff.findUnique({
        //   where: { id: createAppointmentDto.staffId },
        // });
        // if (!staff) {
        //   throw new HttpException(`Staff with ID ${createAppointmentDto.staffId} not found`, HttpStatus.BAD_REQUEST);
        // }

        const appointment = await prisma.appointment.create({
          data: {
            customerId: createAppointmentDto.customerId,
            petId: createAppointmentDto.petId,
            // staffId: createAppointmentDto.staffId,
            dateTime: new Date(createAppointmentDto.dateTime),
            status: createAppointmentDto.status as any, // Ensure status matches BookingStatus enum
            createdBy: user.id,
            updatedBy: user.id
          },
        })

        const appointmentServices = await Promise.all(
          createAppointmentDto.appointmentServices?.map(async (service) => {
            const existingService = await prisma.service.findUnique({
              where: { id: service.serviceId },
            });
            if (!existingService) {
              throw new HttpException(`Service with ID ${service.serviceId} not found`, HttpStatus.BAD_REQUEST);
            }
            const appointmentService = await prisma.appointmentService.create({
              data: {
                appointmentId: appointment.id,
                serviceId: service.serviceId,
                createdBy: user.id,
                updatedBy: user.id
              },
            });

            const optionServices = await Promise.all(
              service.optionService?.map(async (option) => {
                const existingOptionService = await prisma.option.findUnique({
                  where: { id: option.optionId },
                });
                if (!existingOptionService) {
                  throw new HttpException(`Option Service with ID ${option.optionId} not found`, HttpStatus.BAD_REQUEST);
                }

                return await prisma.appointmentServiceOption.create({
                  data: {
                    appointmentServiceId: appointmentService.id,
                    optionId: option.optionId,
                    createdBy: user.id,
                    updatedBy: user.id
                  },
                });
              })
            );
            return { ...appointmentService, optionService: optionServices };
          })
        )
        return { ...appointment, services: appointmentServices };
      })

      const createOrder = await this.orderService.create(user, { appointmentId: newAppointment.id } as any);
      return { ...newAppointment, order: createOrder };
    } catch (error) {
      throw new HttpException(`Database query failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll() {
    try {

      // query all appointments and query order for each appointment and review
      return await this.prisma.appointment.findMany({
        include: {
          customer: true,
          pet: true,
          staff: true,
          appointmentService: {
            include: {
              service: true,
              appointmentServiceOption: {
                include: {
                  option: true
                }
              }
            }
          },
          order: true,
          review: true
        }
      });

    } catch (error) {
      throw new HttpException(`Database query failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string) {
    try {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id },
        include: {
          customer: true,
          pet: true,
          staff: true,
          appointmentService: {
            include: {
              service: true,
              appointmentServiceOption: {
                include: {
                  option: true
                }
              }
            }
          },
          order: true,
          review: true
        }
      });
      if (!appointment) {
        throw new HttpException(`Appointment with ID ${id} not found`, HttpStatus.NOT_FOUND);
      }
      return appointment;
    } catch (error) {
      throw new HttpException(`Database query failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
  //   return `This action updates a #${id} appointment`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} appointment`;
  // }
}
