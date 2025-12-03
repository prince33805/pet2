// src/shared/s3/s3.service.ts
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

@Injectable()
export class S3Service {
  private s3 = new S3Client({ region: process.env.S3_REGION });

  async getPresignedUploadUrl(input: {
    folder: string;        // เช่น 'pets'
    filename: string;      // ชื่อไฟล์เดิมจาก FE
    contentType: string;   // image/jpeg, image/png
    customerId: string;    // ใช้ประกอบ path ให้เป็นระเบียบ
  }) {
    const ext = input.filename.split('.').pop()?.toLowerCase() ?? 'jpg';
    const key = `${input.folder}/${input.customerId}/${randomUUID()}.${ext}`;

    const cmd = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      ContentType: input.contentType,
      // (ถ้าอยากตรวจขนาด ทำที่ฝั่ง FE และเช็กอีกชั้นใน BE ตอน create)
    });

    const uploadUrl = await getSignedUrl(this.s3, cmd, { expiresIn: 60 * 5 });

    // public URL (ถ้าใช้ CloudFront)
    const publicUrl = process.env.S3_PUBLIC_BASE
      ? `${process.env.S3_PUBLIC_BASE}/${key}`
      : `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;

    return { uploadUrl, key, publicUrl };
  }
}
