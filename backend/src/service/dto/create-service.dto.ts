import { IsNotEmpty, IsNumber, IsString, Length, MaxLength, Min } from 'class-validator';

export class CreateServiceDto {
    @IsString()
    @Length(3, 20)
    @IsNotEmpty()
    name: string;

    @IsString()
    @MaxLength(500)
    description: string;

    @IsString()
    @Length(2, 3)
    @IsNotEmpty()
    duration: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    price: number;

    options?: OptionService[];
}

export class OptionService {
    @IsString()
    @Length(3, 20)
    @IsNotEmpty()
    name: string;

    @IsString()
    @Length(3, 50)
    description: string;

    @IsNumber()
    @IsNotEmpty()
    price: number;

}