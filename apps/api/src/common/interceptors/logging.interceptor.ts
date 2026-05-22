import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;
    const correlationId = request.headers['x-correlation-id'] || 'N/A';
    const userAgent = request.get('user-agent') || 'N/A';
    const now = Date.now();

    this.logger.log(
      `→ ${method} ${url} [${correlationId}] ${ip} ${userAgent}`,
      'HTTP',
    );

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const duration = Date.now() - now;

        this.logger.log(
          `← ${method} ${url} ${response.statusCode} ${duration}ms [${correlationId}]`,
          'HTTP',
        );

        // Warn on slow requests (>3s)
        if (duration > 3000) {
          this.logger.warn(
            `Slow request: ${method} ${url} took ${duration}ms`,
            'HTTP',
          );
        }
      }),
    );
  }
}
