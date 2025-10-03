import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) { }

  async create(user: any, createReviewDto: CreateReviewDto) {
    try {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: createReviewDto.appointmentId.toString() },
      })

      if (!appointment) {
        throw new HttpException(`Appointment with ID ${createReviewDto.appointmentId} not found`, HttpStatus.BAD_REQUEST);
      }
      // check appointment if its completed or not
      if (appointment.status !== 'COMPLETED') {
        throw new HttpException(`You can only review completed appointments`, HttpStatus.BAD_REQUEST);
      }
      // check appointment if its owned by this user or not
      if (appointment.customerId !== user.id) {
        throw new HttpException(`You are not authorized to review this appointment`, HttpStatus.FORBIDDEN);
      }

      //create review
      const newReview = await this.prisma.review.create({
        data: {
          appointmentId: createReviewDto.appointmentId.toString(),
          customerId: user.id,
          rating: createReviewDto.rating,
          comment: createReviewDto.comment,
          createdBy: user.id,
          updatedBy: user.id
        },
      });

      return newReview;
    } catch (error) {
      throw new HttpException(`Database query failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // findAll() {
  //   return `This action returns all review`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} review`;
  // }

  // update(id: number, updateReviewDto: UpdateReviewDto) {
  //   return `This action updates a #${id} review`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} review`;
  // }
}
