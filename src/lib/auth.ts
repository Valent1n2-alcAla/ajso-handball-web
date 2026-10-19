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

/** Liste complète (pages de 200 enchaînées, 2 000 éléments au plus). */
export async function listeAdmin<T>(path: string): Promise<T[]> {
  const sep = path.includes('?') ? '&' : '?';
  const page = async (n: number) => {
    const res = await apiAdmin(`${path}${sep}itemsPerPage=200${n > 1 ? `&page=${n}` : ''}`);
    return res.ok ? await res.json().catch(() => null) : null;
  };
  const premiere = await page(1);
  const items = membres<T>(premiere);
  const total: number = premiere?.totalItems ?? premiere?.['hydra:totalItems'] ?? items.length;
  const pages = Math.min(Math.ceil(total / 200), 10);
  if (pages <= 1) return items;
  const suite = await Promise.all(Array.from({ length: pages - 1 }, (_, i) => page(i + 2)));
  return [...items, ...suite.flatMap((d) => membres<T>(d))];
}
