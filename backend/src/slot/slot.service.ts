import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as tz from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(tz);

@Injectable()
export class SlotService {
  constructor(private prisma: PrismaService) { }

  /**
   * สร้าง slot ล่วงหน้า 30 วัน (จ–ศ 9–18) cap=1
   * startISO เช่น '2025-11-05'
   */
  async preGenerate30Days(startISO: string) {
    const zone = 'Asia/Bangkok';
    const start = dayjs.tz(startISO, zone).startOf('day');
    console.log("start", start)

    // ✅ สำคัญ: ใส่ชนิดให้เป็น PrismaPromise[]
    const ops: Prisma.PrismaPromise<any>[] = [];

    for (let i = 0; i < 30; i++) {
      const d = start.add(i, 'day');
      const dow = d.day(); // 0=Sun ... 6=Sat
      if (dow === 0 || dow === 6) continue; // ข้าม ส/อา

      for (let hr = 9; hr < 18; hr++) {
        const startMin = hr * 60;
        const endMin = (hr + 1) * 60;

        // คีย์ unique คือ (date, startMin) → ชื่อคอมโพสิตที่ Prisma สร้างคือ date_startMin
        ops.push(
          this.prisma.slot.upsert({
            where: { date_startMin: { date: d.toDate(), startMin } },
            update: {}, // ถ้าอยากรีเซ็ตค่า ให้เติมตรงนี้
            create: {
              date: d.toDate(),
              startMin,
              endMin,
              capacity: 10,
              remaining: 10,
            },
          })
        );
      }
    }

    if (ops.length) {
      await this.prisma.$transaction(ops);
    }

    return { ok: true, count: ops.length };
  }

  async availability(dateISO?: string) {
    if (!dateISO) {
      throw new BadRequestException('Missing required query parameter: date');
    }

    const zone = 'Asia/Bangkok';
    const target = dayjs.tz(dateISO, zone).startOf('day').toDate();

    const slots = await this.prisma.slot.findMany({
      where: { date: target },
      select: { id: true, startMin: true, endMin: true, remaining: true },
      orderBy: { startMin: 'asc' },
    });

    return {
      date: dateISO,
      slots,
      isAvailable: slots.length > 0,
    };
  }

}
