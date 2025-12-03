import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderService } from 'src/order/order.service';
import { Prisma, PrismaClient } from '@prisma/client';
import { CustomerService } from 'src/customer/customer.service';
import { OrderPayloadDto } from './dto/order-payload.dto';
import { DateTime } from 'luxon';
import { ZOrderPayload } from './dto/order-payload.zod';

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);
  constructor(
    private prisma: PrismaService,
    private orderService: OrderService,
    private loyalty: CustomerService,
  ) { }

  private toUTC(dateIso: string): Date {
    // รับ ISO ที่มี offset แล้ว normalize เป็น UTC
    const dt = DateTime.fromISO(dateIso);
    if (!dt.isValid) throw new HttpException('Invalid dateTime', HttpStatus.BAD_REQUEST);
    return new Date(dt.toUTC().toISO()!);
  }

  // async createOrderWithAppointments(user: any, orderPayload: OrderPayloadDto) {
  //   const payload = ZOrderPayload.parse(orderPayload);
  //   console.log("payload", payload)
  //   const reqId = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  //   this.logger.log(`createOrderWithAppointments start reqId=${reqId}`);

  //   // Zod/DTO จะกรองเบื้องต้นแล้ว ที่นี่สมมุติผ่าน DTO มา
  //   const dateUtc = this.toUTC(payload.dateTime);
  //   const status = payload.status ?? 'SCHEDULED';

  //   return this.prisma.$transaction(async (tx) => {
  //     // ******** Idempotency ********
  //     if (payload.idempotencyKey) {
  //       const existed = await tx.order.findUnique({ where: { idempotencyKey: payload.idempotencyKey } });
  //       if (existed) {
  //         this.logger.warn(`idempotent hit reqId=${reqId} key=${payload.idempotencyKey}`);
  //         // ดึง appointments ที่เชื่อมกับ order นี้คืนได้ถ้าต้องการ
  //         return { order: existed };
  //       }
  //     }

  //     // ******** Prefetch batch ********
  //     const petIds = [...new Set(payload.pets.map(p => p.petId))];
  //     const svcIds = [
  //       ...new Set(payload.pets.flatMap(p => p.services.map(s => s.serviceId)))
  //     ];
  //     const optIds = [
  //       ...new Set(payload.pets.flatMap(p => p.services.flatMap(s => s.options?.map(o => o.optionId) ?? [])))
  //     ];

  //     const [customer, pets, services, options] = await Promise.all([
  //       tx.customer.findUnique({ where: { id: payload.customerId } }),
  //       tx.pet.findMany({ where: { id: { in: petIds } }, select: { id: true, customerId: true } }),
  //       tx.service.findMany({ where: { id: { in: svcIds } }, select: { id: true, price: true } }),
  //       tx.option.findMany({ where: { id: { in: optIds } }, select: { id: true, serviceId: true, price: true } }),
  //     ]);

  //     if (!customer) throw new HttpException(`Customer ${payload.customerId} not found`, HttpStatus.BAD_REQUEST);

  //     // validate pet-customer
  //     const petMap = new Map<string, { id: string; customerId: string }>(
  //       pets.map((p: any) => [p.id, p as unknown as { id: string; customerId: string }])
  //     );
  //     for (const pid of petIds) {
  //       const p = petMap.get(pid);
  //       if (!p) throw new HttpException(`Pet ${pid} not found`, HttpStatus.BAD_REQUEST);
  //       if (p.customerId !== payload.customerId) {
  //         throw new HttpException(`Pet ${pid} does not belong to customer ${payload.customerId}`, HttpStatus.BAD_REQUEST);
  //       }
  //     }

  //     const svcMap = new Map<string, { id: string; price: any }>(services.map(s => [s.id, s as any]));
  //     const optMap = new Map<string, { id: string; serviceId: string; price: any }>(options.map(o => [o.id, o as any]));

  //     // validate option-service relation
  //     for (const pet of payload.pets) {
  //       for (const svc of pet.services) {
  //         if (!svcMap.get(svc.serviceId)) {
  //           throw new HttpException(`Service ${svc.serviceId} not found`, HttpStatus.BAD_REQUEST);
  //         }
  //         for (const opt of svc.options ?? []) {
  //           const o = optMap.get(opt.optionId);
  //           if (!o) throw new HttpException(`Option ${opt.optionId} not found`, HttpStatus.BAD_REQUEST);
  //           if (o.serviceId !== svc.serviceId) {
  //             throw new HttpException(`Option ${opt.optionId} is not under service ${svc.serviceId}`, HttpStatus.BAD_REQUEST);
  //           }
  //         }
  //       }
  //     }

  //     // ******** Create appointments & accumulate total with snapshots ********
  //     let total = new (Prisma as any).Decimal(0);
  //     // let total = 0;
  //     const createdAppointmentIds: string[] = [];

  //     for (const p of payload.pets) {
  //       const appt = await tx.appointment.create({
  //         data: {
  //           // slot: '',
  //           customerId: payload.customerId,
  //           petId: p.petId,
  //           staffId: payload.staffId ?? null,
  //           dateTime: dateUtc,
  //           status,
  //           createdBy: user.id,
  //           updatedBy: user.id,
  //         },
  //         select: { id: true },
  //       });

  //       createdAppointmentIds.push(appt.id);

  //       for (const s of p.services) {
  //         const sRow = svcMap.get(s.serviceId)!;
  //         total = total.add(sRow.price);

  //         const apptSvc = await tx.appointmentService.create({
  //           data: {
  //             appointmentId: appt.id,
  //             serviceId: s.serviceId,
  //             priceAtBooking: sRow.price, // snapshot
  //             createdBy: user.id,
  //             updatedBy: user.id,
  //           },
  //           select: { id: true },
  //         });

  //         const opts = s.options ?? [];
  //         if (opts.length) {
  //           // createMany เพื่อลด I/O
  //           const toCreate = opts.map(o => {
  //             const orow = optMap.get(o.optionId)!;
  //             total = total.add(orow.price);
  //             return {
  //               appointmentServiceId: apptSvc.id,
  //               optionId: orow.id,
  //               priceAtBooking: orow.price,
  //               createdBy: user.id,
  //               updatedBy: user.id,
  //             };
  //           });
  //           await tx.appointmentServiceOption.createMany({ data: toCreate });
  //         }
  //       }
  //     }

  //     // ******** Create order (connect appointments) + idempotencyKey ********
  //     const order = await tx.order.create({
  //       data: {
  //         amount: total,
  //         method: 'CASH',
  //         status: 'PENDING',
  //         idempotencyKey: payload.idempotencyKey ?? null,
  //         createdBy: user.id,
  //         updatedBy: user.id,
  //         appointments: { connect: createdAppointmentIds.map(id => ({ id })) },
  //       },
  //     });

  //     // ******** Loyalty ********
  //     // await this.loyalty.addPoints({
  //     //   customerId: payload.customerId,
  //     //   orderId: order.id,
  //     //   amount: total,        // ให้ service ไปคำนวณ rules/เปอร์เซ็นต์เอง
  //     //   actorUserId: user.id,
  //     //   reason: 'ORDER_CREATED',
  //     // });

  //     this.logger.log(`createOrderWithAppointments success reqId=${reqId} order=${order.id} appts=${createdAppointmentIds.length}`);
  //     return { orderId: order.id, appointmentIds: createdAppointmentIds, amount: order.amount };
  //   }); // SERIALIZABLE (default)
  // }

  async createOrderWithAppointments(user: any, orderPayload: OrderPayloadDto) {
    const payload = ZOrderPayload.parse(orderPayload);
    console.log("payload", payload)
    const reqId = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    this.logger.log(`createOrderWithAppointments start reqId=${reqId}`);

    // validate presence of startSlotId
    if (!payload.startSlotId) {
      throw new HttpException('startSlotId is required', HttpStatus.BAD_REQUEST);
    }
    // Zod/DTO จะกรองเบื้องต้นแล้ว ที่นี่สมมุติผ่าน DTO มา
    const status = payload.status ?? 'SCHEDULED';

    return this.prisma.$transaction(async (tx) => {
      // ******** Idempotency ********
      if (payload.idempotencyKey) {
        const existed = await tx.order.findUnique({ where: { idempotencyKey: payload.idempotencyKey } });
        if (existed) {
          this.logger.warn(`idempotent hit reqId=${reqId} key=${payload.idempotencyKey}`);
          // ดึง appointments ที่เชื่อมกับ order นี้คืนได้ถ้าต้องการ
          return { order: existed };
        }
      }

      // ******** Prefetch batch ********
      const petIds = [...new Set(payload.pets.map(p => p.petId))];
      const svcIds = [...new Set(payload.pets.flatMap(p => p.services.map(s => s.serviceId)))];
      const optIds = [...new Set(payload.pets.flatMap(p => p.services.flatMap(s => s.options?.map(o => o.optionId) ?? [])))];

      const [customer, pets, services, options, startSlot] = await Promise.all([
        tx.customer.findUnique({ where: { id: payload.customerId } }),
        tx.pet.findMany({ where: { id: { in: petIds } }, select: { id: true, customerId: true } }),
        // NOTE: assume Service has durationMinutes field; if not, default will be used later
        tx.service.findMany({ where: { id: { in: svcIds } }, select: { id: true, price: true, duration: true } }),
        tx.option.findMany({ where: { id: { in: optIds } }, select: { id: true, serviceId: true, price: true } }),
        tx.slot.findUnique({ where: { id: payload.startSlotId }, select: { id: true, date: true, startMin: true, remaining: true } })
      ]);

      if (!customer) throw new HttpException(`Customer ${payload.customerId} not found`, HttpStatus.BAD_REQUEST);
      if (!startSlot) throw new HttpException(`startSlot ${payload.startSlotId} not found`, HttpStatus.BAD_REQUEST);

      // validate pet-customer
      const petMap = new Map<string, { id: string; customerId: string }>(
        pets.map((p: any) => [p.id, p as unknown as { id: string; customerId: string }])
      );
      for (const pid of petIds) {
        const p = petMap.get(pid);
        if (!p) throw new HttpException(`Pet ${pid} not found`, HttpStatus.BAD_REQUEST);
        if (p.customerId !== payload.customerId) {
          throw new HttpException(`Pet ${pid} does not belong to customer ${payload.customerId}`, HttpStatus.BAD_REQUEST);
        }
      }

      const svcMap = new Map<string, { id: string; price: any; duration?: number }>(services.map(s => [s.id, s as any]));
      const optMap = new Map<string, { id: string; serviceId: string; price: any; duration?: number }>(options.map(o => [o.id, o as any]));

      // validate option-service relation
      for (const pet of payload.pets) {
        for (const svc of pet.services) {
          if (!svcMap.get(svc.serviceId)) {
            throw new HttpException(`Service ${svc.serviceId} not found`, HttpStatus.BAD_REQUEST);
          }
          for (const opt of svc.options ?? []) {
            const o = optMap.get(opt.optionId);
            if (!o) throw new HttpException(`Option ${opt.optionId} not found`, HttpStatus.BAD_REQUEST);
            if (o.serviceId !== svc.serviceId) {
              throw new HttpException(`Option ${opt.optionId} is not under service ${svc.serviceId}`, HttpStatus.BAD_REQUEST);
            }
          }
        }
      }

      // ******** Prepare slot queries (compute needed startMin per appointment) ********
      // helper
      const SLOT_DURATION = 60; // นาที (ตามที่กำหนด)
      type ApptInfo = { petIndex: number; startMin: number; totalDuration: number };
      const apptInfos: ApptInfo[] = [];
      let cursorStartMin = startSlot.startMin;

      for (let i = 0; i < payload.pets.length; i++) {
        const p = payload.pets[i];
        let totalDuration = 0;
        for (const s of p.services) {
          const sRow = svcMap.get(s.serviceId)!;
          const dur = Number(sRow?.duration ?? sRow?.duration ?? 30);
          if (Number.isNaN(dur) || dur <= 0) {
            throw new HttpException(`Invalid duration for service ${s.serviceId}`, HttpStatus.BAD_REQUEST);
          }
          totalDuration += dur;
        }
        apptInfos.push({ petIndex: i, startMin: cursorStartMin, totalDuration });
        cursorStartMin += totalDuration; // sequential
      }

      // collect all needed startMins across all appointments (slots are 60-min aligned)
      const neededStartMinsSet = new Set<number>();
      const apptToSlots = new Map<number, number[]>(); // petIndex -> slot startMins

      for (const ai of apptInfos) {
        console.log("ai.totalDuration", ai.totalDuration)
        const slotsNeeded = Math.ceil(ai.totalDuration / SLOT_DURATION);
        console.log("slotsNeeded", slotsNeeded)
        const starts: number[] = [];
        for (let k = 0; k < slotsNeeded; k++) {
          const st = ai.startMin + k * SLOT_DURATION;
          starts.push(st);
          neededStartMinsSet.add(st);
        }
        apptToSlots.set(ai.petIndex, starts);
      }
      const neededStartMins = Array.from(neededStartMinsSet);
      console.log("apptToSlots", apptToSlots)
      console.log("neededStartMins", neededStartMins)

      // fetch slots for that date and those startMin
      const slotDate = new Date(startSlot.date); // assume stored in DB in UTC or controlled tz
      const slots = await tx.slot.findMany({
        where: {
          date: slotDate,
          startMin: { in: neededStartMins },
        },
        select: { id: true, startMin: true, remaining: true },
      });
      interface SlotInfo {
        id: string;
        startMin: number;
        remaining: number;
      }
      const slotMap = new Map<number, SlotInfo>(slots.map(s => [s.startMin, s]));

      // ensure every required start exists
      for (const sMin of neededStartMins) {
        if (!slotMap.has(sMin)) {
          throw new HttpException(`No slot for date ${slotDate.toISOString().slice(0, 10)} startMin=${sMin}`, HttpStatus.BAD_REQUEST);
        }
      }

      // check capacities: for each slotStart, compute demand (how many appointments will use this slot)
      const demand = new Map<number, number>();
      for (const starts of apptToSlots.values()) {
        for (const st of starts) demand.set(st, (demand.get(st) ?? 0) + 1);
      }
      for (const [st, d] of demand.entries()) {
        const s = slotMap.get(st)!;
        if (s.remaining < d) {
          throw new HttpException(`Slot startMin=${st} has insufficient remaining (need ${d}, have ${s.remaining})`, HttpStatus.BAD_REQUEST);
        }
      }

      // now create appointments and appointmentSlots, decrement remaining per slot
      const createdAppointmentIds: string[] = [];
      let total = new (Prisma as any).Decimal(0);

      for (const ai of apptInfos) {
        const p = payload.pets[ai.petIndex];
        // compute appointment.dateTime from slotDate + ai.startMin
        const apptDateTime = new Date(Date.UTC(
          slotDate.getUTCFullYear(),
          slotDate.getUTCMonth(),
          slotDate.getUTCDate(),
          0, // hour 0 + minutes = startMin
          ai.startMin
        ));

        const appt = await tx.appointment.create({
          data: {
            customerId: payload.customerId,
            petId: p.petId,
            staffId: payload.staffId ?? null,
            dateTime: apptDateTime,
            status: payload.status ?? 'SCHEDULED',
            createdBy: user.id,
            updatedBy: user.id,
          },
          select: { id: true },
        });
        createdAppointmentIds.push(appt.id);

        // services & options (price snapshot)
        for (const s of p.services) {
          const sRow = svcMap.get(s.serviceId)!;
          total = total.add(sRow.price);

          const apptSvc = await tx.appointmentService.create({
            data: {
              appointmentId: appt.id,
              serviceId: s.serviceId,
              priceAtBooking: sRow.price,
              createdBy: user.id,
              updatedBy: user.id,
            },
            select: { id: true },
          });

          const opts = s.options ?? [];
          if (opts.length) {
            const toCreate = opts.map(o => {
              const orow = optMap.get(o.optionId)!;
              total = total.add(orow.price);
              return {
                appointmentServiceId: apptSvc.id,
                optionId: orow.id,
                priceAtBooking: orow.price,
                createdBy: user.id,
                updatedBy: user.id,
              };
            });
            await tx.appointmentServiceOption.createMany({ data: toCreate });
          }
        }

        // attach appointment to each slot and decrement remaining
        const starts = apptToSlots.get(ai.petIndex)!;
        for (const st of starts) {
          const slot = slotMap.get(st)!;
          await tx.appointmentSlot.create({
            data: { appointmentId: appt.id, slotId: slot.id },
          });
          await tx.slot.update({
            where: { id: slot.id },
            data: { remaining: { decrement: 1 } as any },
          });
          // reflect change locally
          slot.remaining = slot.remaining - 1;
        }
      }

      // finally create order connecting appointments as before
      const order = await tx.order.create({
        data: {
          amount: total,
          method: 'CASH',
          status: 'PENDING',
          idempotencyKey: payload.idempotencyKey ?? null,
          createdBy: user.id,
          updatedBy: user.id,
          appointments: { connect: createdAppointmentIds.map(id => ({ id })) },
        },
      });

      this.logger.log(`createOrderWithAppointments success reqId=${reqId} order=${order.id} appts=${createdAppointmentIds.length}`);
      return { orderId: order.id, appointmentIds: createdAppointmentIds, amount: order.amount };
    }); // SERIALIZABLE (default)
  }

  async findAll(params: { page?: number; limit?: number; search?: string; sort?: 'asc' | 'desc'; }) {
    try {
      const { page = 1, limit = 10, search, sort = 'desc' } = params;
      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }
      const totalCount = await this.prisma.appointment.count({ where });
      const appointments = await this.prisma.appointment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: sort },
        include: {
          order: true,
          customer: true,
          staff: true,
        }
      });
      // query all appointments and query order for each appointment and review
      return {
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
        appointments,
      }

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
