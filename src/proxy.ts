import { NextResponse, type NextRequest } from 'next/server';

/** Vérification optimiste : sans cookie de session, l'espace admin renvoie vers la connexion. */
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin/login')) return NextResponse.next();
  if (!request.cookies.has('ajso_token')) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
