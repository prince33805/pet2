import { IsArray, IsDate, IsNotEmpty, IsNumber, IsString, IsUUID, Length } from 'class-validator';

export class CreateAppointmentDto {
    @IsString()
    @IsUUID()
    @Length(36)
    @IsNotEmpty()
    customerId: string;

    @IsString()
    @IsUUID()
    @Length(36)
    @IsNotEmpty()
    petId: string;

    @IsString()
    @IsUUID()
    @Length(36)
    staffId: string;

    @IsString()
    @IsNotEmpty()
    dateTime: string;

    @IsString()
    @IsNotEmpty()
    status: string;

    @IsNotEmpty()
    @IsArray()
    appointmentServices: AppointmentService[] = [];

}

export class AppointmentService {
    @IsString()
    @IsUUID()
    @Length(36)
    @IsNotEmpty()
    serviceId: string;

    @IsNotEmpty()
    @IsArray()
    optionService: OptionService[];
}

export class OptionService {
    @IsUUID()
    @IsString()
    @Length(36)
    @IsNotEmpty()
    optionId: string;
}
