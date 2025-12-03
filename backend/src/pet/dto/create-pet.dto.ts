import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, IsUUID, Length, Min } from 'class-validator';

export class CreatePetDto {
    @IsString()
    @Length(3, 20)
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsUUID()
    @Length(36)
    @IsNotEmpty()
    customerId: string;

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

    @IsString()
    @Length(1, 10)
    @IsNotEmpty()
    weight: string;

    @IsString()
    healthNotes: string;

    // --- รูป (optional, ใช้เมื่อ FE อัปโหลดเสร็จแล้ว) ---
    @IsOptional() @IsString()
    imageKey?: string;     // s3 object key เช่น pets/1234/uuid.jpg

    @IsOptional() @IsUrl()
    imageUrl?: string;     // ถ้ามี CloudFront หรือเปิด public อ่าน URL นี้ได้เลย

    @IsOptional() @IsString()
    imageMime?: string;

    @IsOptional() @IsInt() @Min(0)
    imageSize?: number;

}
