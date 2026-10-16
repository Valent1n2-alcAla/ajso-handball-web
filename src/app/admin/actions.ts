'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { apiAdmin, COOKIE_TOKEN, expirationJwt } from '@/lib/auth';
import { RESSOURCES, type Champ } from '@/lib/admin-ressources';

export type EtatFormulaire = {
  erreur?: string;
  erreurs?: Record<string, string>;
  /** Valeurs saisies, renvoyées pour ne pas vider le formulaire en cas d'erreur. */
  valeurs?: Record<string, string | boolean>;
};

function valeursSaisies(fd: FormData, cases: string[] = []): Record<string, string | boolean> {
  const v: Record<string, string | boolean> = {};
  for (const [k, val] of fd.entries()) if (typeof val === 'string' && !k.startsWith('$')) v[k] = val;
  for (const c of cases) v[c] = fd.get(c) === 'on';
  return v;
}

export async function connexion(_prev: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const email = String(fd.get('email') ?? '').trim();
  const password = String(fd.get('password') ?? '');
  const valeurs = { email };
  if (!email || !password) return { erreur: 'Email et mot de passe requis.', valeurs };

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });
  } catch {
    return { erreur: "L'API est injoignable.", valeurs };
  }
  if (res.status === 429) return { erreur: 'Trop de tentatives. Réessayez dans quelques minutes.', valeurs };
  if (!res.ok) return { erreur: 'Identifiants incorrects.', valeurs };

  const { token } = (await res.json()) as { token: string };
  const exp = expirationJwt(token);
  (await cookies()).set(COOKIE_TOKEN, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: exp ? new Date(exp * 1000) : undefined,
  });
  redirect('/admin');
}

export async function deconnexion() {
  (await cookies()).delete(COOKIE_TOKEN);
  redirect('/admin/login');
}

/** Convertit une valeur de formulaire selon le type du champ. */
function convertir(champ: Champ, fd: FormData): unknown {
  if (champ.type === 'checkbox') return fd.get(champ.nom) === 'on';
  const brut = String(fd.get(champ.nom) ?? '').trim();
  if (brut === '') return champ.type === 'text' || champ.type === 'textarea' ? (champ.requis ? '' : null) : null;
  if (champ.type === 'number' || champ.type === 'select-int') return Number(brut);
  return brut; // relation (IRI), date, time, datetime-local, url, select
}

export async function enregistrer(cle: string, id: string | null, _prev: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const ressource = RESSOURCES[cle];
  if (!ressource) return { erreur: 'Ressource inconnue.' };


  const valeurs = valeursSaisies(fd, ressource.champs.filter((c) => c.type === 'checkbox').map((c) => c.nom));
  const corps: Record<string, unknown> = {};
  for (const champ of ressource.champs) corps[champ.nom] = convertir(champ, fd);

  const res = await apiAdmin(id ? `${ressource.endpoint}/${encodeURIComponent(id)}` : ressource.endpoint, {
    method: id ? 'PATCH' : 'POST',
    headers: { 'Content-Type': id ? 'application/merge-patch+json' : 'application/ld+json' },
    body: JSON.stringify(corps),
  });

  if (res.status === 422) {
    const data = await res.json();
    const erreurs: Record<string, string> = {};
    for (const v of data.violations ?? []) erreurs[v.propertyPath] = v.message;
    return { erreur: 'Merci de corriger les champs signalés.', erreurs, valeurs };
  }
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { erreur: data?.detail ?? data?.description ?? `Erreur ${res.status}`, valeurs };
  }

  revalidatePath('/', 'layout');
  redirect(`/admin/${cle}?ok=1`);
}

export async function supprimer(cle: string, id: string) {
  const ressource = RESSOURCES[cle];
  if (!ressource) return;
  const res = await apiAdmin(`${ressource.endpoint}/${encodeURIComponent(id)}`, { method: 'DELETE' });
  revalidatePath('/', 'layout');
  redirect(`/admin/${cle}?${res.ok ? 'supprime=1' : 'erreur=suppression'}`);
}

export async function marquerMessage(id: string, lu: boolean) {
  await apiAdmin(`/api/message_contacts/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify({ lu }),
  });
  revalidatePath('/admin', 'layout');
}

export async function supprimerMessage(id: string) {
  await apiAdmin(`/api/message_contacts/${encodeURIComponent(id)}`, { method: 'DELETE' });
  revalidatePath('/admin', 'layout');
}
