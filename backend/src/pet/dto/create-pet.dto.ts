import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';

export class CreatePetDto {
    @IsString()
    @Length(3, 20)
    @IsNotEmpty()
    name: string;

    @IsString()
    @Length(3, 20)
    @IsNotEmpty()
    species: string;

    @IsString()
    @Length(3, 20)
    @IsNotEmpty()
    breed: string;

    @IsString()
    @Length(3, 10)
    @IsNotEmpty()
    gender: string;
    
    @IsString()
    @Length(1, 10)
    @IsNotEmpty()
    age: string;
    
    @IsNumber()
    @IsNotEmpty()
    weight: number;

    @IsString()
    @Length(3, 50)
    healthNotes: string;
}
