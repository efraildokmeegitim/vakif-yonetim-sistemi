import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Sunucu içinde beklenmeyen bir hata oluştu.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message || res;
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      const err = exception as any;
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        message = 'Bu kayıt başka bir işlemde (örn: bakiye, fiş, vb.) kullanıldığı için silinemez. Lütfen önce bağlı kayıtları silin.';
      } else if (err.code === 'ER_DUP_ENTRY') {
        message = 'Bu kayıt zaten sistemde mevcut. (Çift kayıt hatası)';
      } else {
        message = 'Veritabanı işlemi sırasında bir hata oluştu: ' + err.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log the error to console for debugging
    console.error('Exception Filter Caught:', exception);

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
