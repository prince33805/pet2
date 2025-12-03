import {
  IsArray, IsISO8601, IsNotEmpty, IsOptional, IsString, IsUUID, Length, ValidateNested, IsEnum
} from 'class-validator';
import { Type } from 'class-transformer';

export enum BookingStatusDto {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

export class OptionServiceDto {
  @IsString() @IsUUID() @Length(36) @IsNotEmpty()
  optionId!: string;
}

export class ServiceDto {
  @IsString() @IsUUID() @Length(36) @IsNotEmpty()
  serviceId!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionServiceDto)
  options?: OptionServiceDto[];
}

export class PetItemDto {
  @IsString() @IsUUID() @Length(36) @IsNotEmpty()
  petId!: string;

  @IsArray() @ValidateNested({ each: true })
  @Type(() => ServiceDto)
  services!: ServiceDto[];
}

export class OrderPayloadDto {
  @IsString() @IsUUID() @Length(36) @IsNotEmpty()
  customerId!: string;

  @IsArray() @ValidateNested({ each: true })
  @Type(() => PetItemDto)
  pets!: PetItemDto[];

  @IsOptional()
  @IsString() @IsUUID() @Length(36)
  staffId?: string | null;

  @IsString() @IsUUID() @Length(36) @IsNotEmpty()
  startSlotId!: string; // ต้องเป็น ISO string

  @IsEnum(BookingStatusDto) // default SCHEDULED ถ้าไม่ส่งมา
  @IsOptional()
  status?: BookingStatusDto;

  // optional: idempotencyKey
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
