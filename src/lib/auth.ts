import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { API_URL, membres } from './api';

export const COOKIE_TOKEN = 'ajso_token';
/** Le jeton n'est envoyé qu'à l'espace admin (pages et Server Actions sous /admin). */
export const CHEMIN_COOKIE = '/admin';

/** Chemin de retour après connexion : uniquement une page relative de l'admin. */
export function retourAdmin(next: unknown): string {
  return typeof next === 'string' && /^\/admin(?:[/?#]|$)/.test(next) && !/[\\\s]/.test(next) && !next.startsWith('/admin/login')
    ? next
    : '/admin';
}

/** Lit l'expiration d'un JWT (sans vérifier la signature : l'API s'en charge). */
export function expirationJwt(token: string): number | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

export async function getToken(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE_TOKEN)?.value;
  if (!token) return null;
  const exp = expirationJwt(token);
  return exp && exp * 1000 > Date.now() ? token : null;
}

/** Garde d'accès des pages et actions admin. */
export async function exigerToken(): Promise<string> {
  const token = await getToken();
  if (!token) redirect('/admin/login');
  return token;
}

/** Appel authentifié à l'API. Redirige vers la connexion si le jeton est refusé. */
export async function apiAdmin(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await exigerToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: 'no-store',
    headers: { Accept: 'application/ld+json', ...init.headers, Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) redirect('/admin/login?expire=1');
  return res;
}

export async function listeAdmin<T>(path: string): Promise<T[]> {
  const sep = path.includes('?') ? '&' : '?';
  const res = await apiAdmin(`${path}${sep}itemsPerPage=200`);
  if (!res.ok) return [];
  return membres<T>(await res.json().catch(() => null));
}
