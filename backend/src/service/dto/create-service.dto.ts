import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';

export class CreateServiceDto {
    @IsString()
    @Length(3, 20)
    @IsNotEmpty()
    name: string;

    @IsString()
    @Length(3, 50)
    description: string;

    @IsString()
    @Length(3, 10)
    @IsNotEmpty()
    duration: string;

    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsNotEmpty()
    optionService: OptionService[];
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