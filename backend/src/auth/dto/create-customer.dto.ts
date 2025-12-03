import { IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';

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

export class CreateStaffDto {
  @IsString()
  @Length(3, 20)
  @IsNotEmpty()
  name: string;

  @IsString()
  @Length(3, 20)
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(3, 20)
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsUUID()
  @Length(36)
  @IsNotEmpty()
  branchId: string;

}