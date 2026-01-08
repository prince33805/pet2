import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { RequestLoggingInterceptor } from './common/interceptors/requestLogging.interceptor';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
      new ValidationPipe({
        disableErrorMessages: false,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    // app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalInterceptors(new RequestLoggingInterceptor(), new TransformInterceptor());

    app.setGlobalPrefix('api');  // <-- เพิ่มบรรทัดนี้

    app.enableCors({
      origin: [
        'https://pet2-sable.vercel.app',
        // 'https://frontend-uat.vercel.app',
        // 'https://frontend-prod.vercel.app',
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  }
  catch (err) {
    console.error("❌ Bootstrap failed:", err);
  }
}
bootstrap();
