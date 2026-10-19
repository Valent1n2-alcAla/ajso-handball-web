'use server';

import { cookies } from 'next/headers';
import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { apiAdmin, CHEMIN_COOKIE, COOKIE_TOKEN, expirationJwt, retourAdmin } from '@/lib/auth';
import { RESSOURCES, type Champ } from '@/lib/admin-ressources';

/** Les données publiques (fetch tagués « api ») et l'espace admin reflètent aussitôt l'écriture. */
function rafraichir() {
  updateTag('api');
  revalidatePath('/admin', 'layout');
}

export type EtatFormulaire = {
  erreur?: string;
  erreurs?: Record<string, string>;
  /** Valeurs saisies, renvoyées pour ne pas vider le formulaire en cas d'erreur. */
  valeurs?: Record<string, string | boolean | string[]>;
};

function valeursSaisies(fd: FormData, cases: string[] = [], multiples: string[] = []): Record<string, string | boolean | string[]> {
  const v: Record<string, string | boolean | string[]> = {};
  for (const [k, val] of fd.entries()) if (typeof val === 'string' && !k.startsWith('$')) v[k] = val;
  for (const c of cases) v[c] = fd.get(c) === 'on';
  for (const m of multiples) v[m] = fd.getAll(m).map(String);
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

  const data = (await res.json().catch(() => null)) as { token?: unknown } | null;
  const token = typeof data?.token === 'string' ? data.token : null;
  if (!token) return { erreur: "Réponse inattendue de l'API.", valeurs };
  const exp = expirationJwt(token);
  (await cookies()).set(COOKIE_TOKEN, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: CHEMIN_COOKIE,
    expires: exp ? new Date(exp * 1000) : undefined,
  });
  redirect(retourAdmin(fd.get('next')));
}

export async function deconnexion() {
  (await cookies()).set(COOKIE_TOKEN, '', { path: CHEMIN_COOKIE, maxAge: 0 });
  redirect('/admin/login');
}

/** Convertit une valeur de formulaire selon le type du champ. */
function convertir(champ: Champ, fd: FormData): unknown {
  if (champ.type === 'checkbox') return fd.get(champ.nom) === 'on';
  if (champ.type === 'relations') return fd.getAll(champ.nom).map(String); // liste d'IRI
  const brut = String(fd.get(champ.nom) ?? '').trim();
  if (brut === '') return champ.type === 'text' || champ.type === 'textarea' ? (champ.requis ? '' : null) : null;
  if (champ.type === 'number' || champ.type === 'select-int') return Number(brut);
  return brut; // relation (IRI), date, time, datetime-local, url, select
}

export async function enregistrer(cle: string, id: string | null, _prev: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  if (!Object.hasOwn(RESSOURCES, cle)) return { erreur: 'Ressource inconnue.' };
  const ressource = RESSOURCES[cle];

  const valeurs = valeursSaisies(fd, ressource.champs.filter((c) => c.type === 'checkbox').map((c) => c.nom), ressource.champs.filter((c) => c.type === 'relations').map((c) => c.nom));
  const corps: Record<string, unknown> = {};
  for (const champ of ressource.champs) corps[champ.nom] = convertir(champ, fd);

  const res = await apiAdmin(id ? `${ressource.endpoint}/${encodeURIComponent(id)}` : ressource.endpoint, {
    method: id ? 'PATCH' : 'POST',
    headers: { 'Content-Type': id ? 'application/merge-patch+json' : 'application/ld+json' },
    body: JSON.stringify(corps),
  });

  if (res.status === 422) {
    const data = await res.json().catch(() => null);
    const erreurs: Record<string, string> = {};
    for (const v of data?.violations ?? []) erreurs[v.propertyPath] = v.message;
    return { erreur: 'Merci de corriger les champs signalés.', erreurs, valeurs };
  }
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { erreur: data?.detail ?? data?.description ?? `Erreur ${res.status}`, valeurs };
  }

  rafraichir();
  // Un nouvel album s'ouvre directement pour y ajouter les photos
  if (cle === 'albums' && !id) {
    const cree = await res.json().catch(() => null);
    if (cree?.id) redirect(`/admin/albums/${cree.id}`);
  }
  redirect(`/admin/${cle}?ok=1`);
}

export async function supprimer(cle: string, id: string) {
  if (!Object.hasOwn(RESSOURCES, cle)) return;
  const res = await apiAdmin(`${RESSOURCES[cle].endpoint}/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (res.ok) rafraichir();
  redirect(`/admin/${cle}?${res.ok ? 'supprime=1' : 'erreur=suppression'}`);
}

export async function marquerMessage(id: string, lu: boolean) {
  const res = await apiAdmin(`/api/message_contacts/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify({ lu }),
  });
  if (!res.ok) redirect('/admin/messages?erreur=1');
  revalidatePath('/admin', 'layout');
}

export async function supprimerMessage(id: string) {
  const res = await apiAdmin(`/api/message_contacts/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) redirect('/admin/messages?erreur=1');
  revalidatePath('/admin', 'layout');
}

export type ResultatEnvoi = { url?: string; erreur?: string };

const TYPES_IMAGE = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const TAILLE_MAX = 10 * 1024 * 1024;

/** Envoie une image à l'API (public/uploads) et renvoie son URL publique. */
export async function televerser(fd: FormData): Promise<ResultatEnvoi> {
  const fichier = fd.get('fichier');
  if (!(fichier instanceof File) || fichier.size === 0) return { erreur: 'Aucun fichier.' };
  if (!TYPES_IMAGE.includes(fichier.type)) return { erreur: 'Format non accepté : JPG, PNG, WebP ou GIF uniquement.' };
  if (fichier.size > TAILLE_MAX) return { erreur: 'Image trop lourde (10 Mo maximum).' };
  const envoi = new FormData();
  envoi.append('fichier', fichier, fichier.name);
  const res = await apiAdmin('/api/medias', { method: 'POST', body: envoi });
  const data = await res.json().catch(() => null);
  if (!res.ok) return { erreur: data?.detail ?? `Envoi refusé (${res.status}).` };
  if (typeof data?.url !== 'string') return { erreur: "Réponse inattendue de l'API." };
  return { url: data.url };
}

export async function ajouterPhoto(albumId: string, url: string, ordre: number): Promise<{ erreur?: string }> {
  const res = await apiAdmin('/api/photos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/ld+json' },
    body: JSON.stringify({ album: `/api/albums/${albumId}`, url, ordre }),
  });
  if (!res.ok) return { erreur: `Photo non enregistrée (${res.status}).` };
  rafraichir();
  return {};
}

export async function modifierPhoto(id: string, champs: { legende?: string | null; ordre?: number }): Promise<{ erreur?: string }> {
  const res = await apiAdmin(`/api/photos/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(champs),
  });
  if (!res.ok) return { erreur: `Modification de la photo impossible (${res.status}).` };
  rafraichir();
  return {};
}

export async function supprimerPhoto(id: string): Promise<{ erreur?: string }> {
  const res = await apiAdmin(`/api/photos/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) return { erreur: `Suppression de la photo impossible (${res.status}).` };
  rafraichir();
  return {};
}

export async function definirCouverture(albumId: string, url: string): Promise<{ erreur?: string }> {
  const res = await apiAdmin(`/api/albums/${encodeURIComponent(albumId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify({ couverture: url }),
  });
  if (!res.ok) return { erreur: `Choix de la couverture impossible (${res.status}).` };
  rafraichir();
  return {};
}

export type ResultatImport = { ok?: string; erreur?: string };

/** Import FFHandball d'une équipe (matchs, scores, classement). */
export async function importerFfhb(equipeId: string): Promise<ResultatImport> {
  const res = await apiAdmin(`/api/ffhb/import/${encodeURIComponent(equipeId)}`, { method: 'POST' });
  const data = await res.json().catch(() => null);
  if (!res.ok) return { erreur: data?.detail ?? `Erreur ${res.status}` };
  if (!data) return { erreur: "Réponse inattendue de l'API." };
  rafraichir();
  const avert = [...(data.infos ?? []), ...(data.ignorees ?? [])].map((m: string) => ` ⚠ ${m}`).join('');
  return { ok: `${data.competitions} compétition(s) : ${data.crees} match(s) ajouté(s), ${data.maj} mis à jour, classements : ${data.classement} lignes.${avert}` };
}
