import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Inject,
} from '@nestjs/common';
import { Response } from 'express';
import Rollbar from 'rollbar';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(@Inject('ROLLBAR') private readonly rollbar: Rollbar) {}
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    this.rollbar.error(exception.message, {
      statusCode: status,
      errors: exception.getResponse(),
    });
    response.status(status).json({
      statusCode: status,
      message: exception.message,
      errors: exception.getResponse(),
    });
  }
}
