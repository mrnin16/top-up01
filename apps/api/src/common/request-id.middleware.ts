import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const r = req as Request & { requestId?: string };
    r.requestId = (req.headers['x-request-id'] as string) ?? randomUUID();
    res.setHeader('x-request-id', r.requestId);
    next();
  }
}
