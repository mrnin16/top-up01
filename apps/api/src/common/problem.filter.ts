import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodError } from 'zod';

@Catch()
export class ProblemFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx  = host.switchToHttp();
    const res  = ctx.getResponse<Response>();
    const req  = ctx.getRequest();

    let status: number;
    let detail: string;
    let issues: unknown = undefined;

    // Zod validation error → 400 with field-level issues
    if (exception instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST;
      detail = 'Validation failed';
      issues = exception.issues.map(i => ({
        path: i.path.join('.'),
        message: i.message,
        code: i.code,
      }));
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const r = exception.getResponse();
      detail = typeof r === 'string'
        ? r
        : (r as any).message ?? exception.message;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      detail = exception instanceof Error ? exception.message : 'Internal server error';
      // Log unexpected errors so they're not invisible
      console.error('[ProblemFilter] Unhandled exception:', exception);
    }

    res.status(status).json({
      type:     'about:blank',
      title:    HttpStatus[status] ?? 'Error',
      status,
      detail,
      ...(issues ? { issues } : {}),
      instance: req.url,
    });
  }
}
