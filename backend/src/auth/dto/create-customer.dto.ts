import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @Length(3, 20)
  @IsNotEmpty()
  fullname: string;

  @IsString()
  @Length(3, 20)
  @IsNotEmpty()
  username: string;

  @IsString()
  @Length(3, 20)
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @Length(10)
  phone: string;
}

export class loginCustomerDto {
  @IsString()
  @Length(3, 20)
  @IsNotEmpty()
  username: string;

  @IsString()
  @Length(3, 20)
  @IsNotEmpty()
  password: string;
}