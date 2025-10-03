import { IsNotEmpty, IsString, IsUUID, Length } from "class-validator";

export class CreateOrderDto {

    @IsString()
    @IsUUID()
    @Length(36)
    @IsNotEmpty()
    appointmentId: String;
}
