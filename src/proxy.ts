import { NextResponse, type NextRequest } from 'next/server';

const COOKIE = 'ajso_token';

/** Jeton expiré ou illisible (la signature est vérifiée par l'API). */
function expire(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

/** Vérification optimiste : sans session valide, l'espace admin renvoie vers la connexion (avec retour à la page demandée). */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
    const res = NextResponse.next();
    // Ancien cookie posé sur « / » (avant sa restriction à /admin) : supprimé pour ne pas fausser la session.
    res.headers.append('Set-Cookie', `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
    return res;
  }
  const token = request.cookies.get(COOKIE)?.value;
  if (!token || expire(token)) {
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('next', pathname + search);
    if (token) url.searchParams.set('expire', '1');
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
