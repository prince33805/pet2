import { ConflictException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePetDto } from './dto/create-pet.dto';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from 'src/shared/s3/s3.service';
import { uuid } from 'zod';

@Injectable()
export class PetService {
  constructor(
    private prisma: PrismaService,
    private readonly s3: S3Service,
  ) { }

  // async getUploadUrl(user: any, body: { filename: string; contentType: string; customerId: string }) {
  //   // validate basic
  //   if (!/^image\/(jpeg|png|webp|gif)$/.test(body.contentType)) {
  //     throw new HttpException('Unsupported content type', HttpStatus.BAD_REQUEST);
  //   }

  //   // (optional) ตรวจว่า user มีสิทธิ์กับ customerId นี้
  //   const customer = await this.prisma.customer.findUnique({ where: { id: body.customerId }, select: { id: true } });
  //   if (!customer) throw new HttpException('Customer not found', HttpStatus.BAD_REQUEST);

  //   return this.s3.getPresignedUploadUrl({
  //     folder: 'pets',
  //     filename: body.filename,
  //     contentType: body.contentType,
  //     customerId: body.customerId,
  //   });
  // }

  async create(user: any, createPetDto: CreatePetDto) {
    try {
      const customer = await this.prisma.customer.findUnique({
        where: { id: createPetDto.customerId },
      });
      if (!customer) {
        throw new ConflictException('User not found');
      }

      // (optional) ถ้ามี imageKey แต่ไม่มี imageUrl ให้ประกอบเองจาก S3_PUBLIC_BASE
      // let imageUrl = createPetDto.imageUrl ?? null;
      // if (!imageUrl && createPetDto.imageKey) {
      //   const base = process.env.S3_PUBLIC_BASE
      //     ? process.env.S3_PUBLIC_BASE
      //     : `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com`;
      //   imageUrl = `${base}/${createPetDto.imageKey}`;
      // }

      const pets = await this.prisma.pet.findFirst({
        where: { name: createPetDto.name, customerId: customer.id },
      });
      console.log("pets", pets)
      if (pets?.id) {
        throw new ConflictException('Pet name already exists');
      }
      const pet = await this.prisma.pet.create({
        data: {
          // id: uuid(), // Generate a UUID for the id field
          customerId: customer.id,
          name: createPetDto.name,
          species: createPetDto.species,
          breed: createPetDto.breed,
          gender: createPetDto.gender,
          age: createPetDto.age,
          weight: Number(createPetDto.weight),
          healthNotes: createPetDto.healthNotes,
          imageUrl: createPetDto.imageUrl ?? null,
          imageKey: createPetDto.imageKey ?? null,
          imageMime: createPetDto.imageMime ?? null,
          imageSize: createPetDto.imageSize ?? null,
          createdBy: user.id,
          updatedBy: user.id,
        },
      } as any);
      return pet;
    } catch (error) {
      throw new HttpException(`Database query failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(params: { page?: number; limit?: number; search?: string; sort?: 'asc' | 'desc'; }) {
    try {
      const { page = 1, limit = 10, search, sort = 'asc' } = params;
      const skip = (page - 1) * limit;
      const order: any = { createdAt: sort === 'desc' ? 'desc' : 'asc' };

      // Build where dynamically and safely
      const where: any = {};
      if (search && search.trim() !== '') {
        const q = search.trim();
        const or: any[] = [];

        // text fields (string) - contains is OK
        or.push({ name: { contains: q, mode: 'insensitive' } });
        or.push({ species: { contains: q, mode: 'insensitive' } });
        or.push({ breed: { contains: q, mode: 'insensitive' } });

        // enum field 'gender' — cannot use contains on enum. Try to match enum exactly.
        // Normalize input to uppercase and check if it matches known enum values.
        const g = q.toUpperCase();
        const ALLOWED_GENDERS = ['MALE', 'FEMALE', 'UNKNOWN']; // adapt to your enum values
        if (ALLOWED_GENDERS.includes(g)) {
          // use equals (or: { gender: g } )
          or.push({ gender: g });
        } else {
          // optionally allow short-forms like 'm', 'f'
          if (g === 'M' || g === 'MA') or.push({ gender: 'MALE' });
          if (g === 'F') or.push({ gender: 'FEMALE' });
        }

        // relation filter for customer (1:1 / many-to-one) use `is`
        or.push({
          customer: {
            is: {
              fullname: { contains: q, mode: 'insensitive' }
            }
          }
        });

        // assign only if we have at least one OR condition
        if (or.length > 0) where.OR = or;
      }

      // console.log('where', JSON.stringify(where));
      // console.log('sort', sort);

      // Run transaction: count + data
      const [totalCountRaw, petsRaw] = await this.prisma.$transaction([
        this.prisma.pet.count({ where }),
        this.prisma.pet.findMany({
          where,
          skip,
          take: limit,
          orderBy: order,
          include: { customer: true },
        }),
      ]);

      // defensive defaults in case something unexpected happens
      const totalCount = typeof totalCountRaw === 'number' ? totalCountRaw : 0;
      const pets = Array.isArray(petsRaw) ? petsRaw : [];

      return {
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / (limit || 1)),
        },
        pets,
      };
    } catch (error) {
      // log the real error so you can see the Prisma validation message
      console.error('findAll error', error);
      throw new HttpException(`Database query failed: ${error?.message || String(error)}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string) {
    try {
      const pet = await this.prisma.pet.findUnique({
        where: { id: id },
        include: {
          appointments: true,
        },
      });
      if (!pet) {
        throw new ConflictException('Pet not found');
      }
      return pet;
    } catch (error) {
      throw new HttpException(`Database query failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} pet`;
  // }

  // update(id: number, updatePetDto: UpdatePetDto) {
  //   return `This action updates a #${id} pet`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} pet`;
  // }
}
