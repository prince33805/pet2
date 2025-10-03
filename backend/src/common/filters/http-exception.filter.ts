import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status: number;
    let message: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      // ถ้า res เป็น object ของ ValidationPipe
      if (typeof res === 'object' && res['message']) {
        message = Array.isArray(res['message']) ? res['message'] : [res['message']];
      } else {
        message = res;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = ['Internal server error'];
    }

    response.status(status).json({
      success: false,
      data: { message: message },
      statusCode: status,
    });
  }
}