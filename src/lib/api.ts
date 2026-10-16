import type {
  Actualite, Album, Club, Creneau, Equipe, Evenement, Gymnase, Joueur, LigneClassement, Partenaire, Produit, Rencontre, Tarif,
} from './types';

/** URL de l'API Symfony, lue côté serveur uniquement. */
export const API_URL = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');

/** Durée de cache des pages publiques (secondes). Les écritures admin invalident immédiatement. */
const REVALIDATE = 60;

type Collection<T> = { member?: T[]; 'hydra:member'?: T[]; totalItems?: number; 'hydra:totalItems'?: number };

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Accept: 'application/ld+json' },
      next: { revalidate: REVALIDATE, tags: ['api'] },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // API injoignable : les pages affichent un état vide plutôt qu'une erreur.
    return null;
  }
}

async function getList<T>(path: string): Promise<T[]> {
  const sep = path.includes('?') ? '&' : '?';
  const data = await getJson<Collection<T>>(`${path}${sep}itemsPerPage=200`);
  return data?.member ?? data?.['hydra:member'] ?? [];
}

export const getClub = async () => (await getList<Club>('/api/clubs'))[0] ?? null;
export const getEquipesClub = () => getList<Equipe>('/api/equipes?estAjso=true');
export const getEquipe = (id: string) => getJson<Equipe>(`/api/equipes/${encodeURIComponent(id)}`);
export const getRencontres = (query = '') => getList<Rencontre>(`/api/rencontres${query}`);
export const getActualites = () => getList<Actualite>('/api/actualites');
export const getActualite = (id: string) => getJson<Actualite>(`/api/actualites/${encodeURIComponent(id)}`);
export const getCreneaux = (query = '') => getList<Creneau>(`/api/creneaux${query}`);
export const getGymnases = () => getList<Gymnase>('/api/gymnases');
export const getPartenaires = () => getList<Partenaire>('/api/partenaires');
export const getTarifs = () => getList<Tarif>('/api/tarifs');

const aujourdhui = () => new Date().toISOString().slice(0, 10);

export const getProchainsMatchs = (query = '') =>
  getRencontres(`?date[after]=${aujourdhui()}&order[date]=asc&order[heure]=asc${query}`).then((r) =>
    r.filter((m) => m.scoreDom == null),
  );

export const getDerniersResultats = (query = '') =>
  getRencontres(`?date[strictly_before]=${aujourdhui()}&order[date]=desc${query}`).then((r) =>
    r.filter((m) => m.scoreDom != null),
  );

export const getClassement = (championnatId: number) => getList<LigneClassement>(`/api/classements?championnat=${championnatId}`);
export const getClassements = () => getList<LigneClassement>('/api/classements');
export const getAlbums = () => getList<Album>('/api/albums');
export const getAlbum = (id: string) => getJson<Album>(`/api/albums/${encodeURIComponent(id)}`);
export const getProduits = () => getList<Produit>('/api/produits');

/** Événements à venir (en cours inclus) ou passés, du plus proche au plus lointain. */
export const getEvenements = (quand: 'avenir' | 'passes') => {
  const auj = aujourdhui();
  return quand === 'avenir'
    ? getList<Evenement>(`/api/evenements?debut[after]=${auj}&order[debut]=asc`)
    : getList<Evenement>(`/api/evenements?debut[strictly_before]=${auj}&order[debut]=desc`);
};
export const getJoueurs = (equipeId: number) => getList<Joueur>(`/api/joueurs?equipe=${equipeId}`);
