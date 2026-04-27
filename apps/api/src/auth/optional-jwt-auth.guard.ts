import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Like JwtAuthGuard but does NOT throw when there's no/invalid token.
 * Sets `req.user = undefined` for anonymous callers; populates it normally
 * when the token is valid.
 *
 * Use this on endpoints that should work for both guests and signed-in users
 * (e.g. anonymous checkout flow).
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Always allow the request through; populate req.user only if token is valid
  handleRequest<TUser = any>(_err: unknown, user: TUser) {
    return user as TUser;   // returns undefined when no/invalid token
  }
}
