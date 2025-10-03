import { IsNotEmpty, IsNumber, IsString, IsUUID, Length } from "class-validator";

export class CreateReviewDto {

    @IsString()
    @IsUUID()
    @Length(36)
    @IsNotEmpty()
    appointmentId: string;

    @IsNumber()
    @IsNotEmpty()
    rating: number

    @IsString()
    @Length(3, 50)
    comment: string
}
