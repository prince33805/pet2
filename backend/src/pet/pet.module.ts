import { Module } from '@nestjs/common';
import { PetService } from './pet.service';
import { PetController } from './pet.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3Service } from 'src/shared/s3/s3.service';

@Module({
  controllers: [PetController],
  providers: [PetService,PrismaService,S3Service],
})
export class PetModule {}
