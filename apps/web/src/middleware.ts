import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Only the /account/* surface requires sign-in. Checkout and order pages
// work for guests too (anonymous order via unguessable cuid).
const PROTECTED = [/^\/account/];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!PROTECTED.some(rx => rx.test(pathname))) return NextResponse.next();

  const hasSession =
    req.cookies.has('topup-session') ||
    req.cookies.has('refresh');

  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*'],
};
