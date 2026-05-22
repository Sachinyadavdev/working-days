import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Custom business logic exception with a meaningful error code.
 * Use this for domain-specific errors (e.g., "Employee already exists").
 */
export class BusinessException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly errorCode?: string,
  ) {
    super(
      {
        statusCode,
        message,
        error: errorCode || 'BusinessError',
      },
      statusCode,
    );
  }
}
