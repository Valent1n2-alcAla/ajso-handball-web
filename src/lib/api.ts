import type {
  Actualite, Album, Club, Creneau, Equipe, Evenement, Gymnase, Joueur, LigneClassement, Participation, Partenaire, Produit, Rencontre, Tarif,
} from './types';
import { aujourdhuiParis } from './format';

/** URL de l'API Symfony, lue côté serveur uniquement. */
export const API_URL = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');

/** Durée de cache des pages publiques (secondes). Les écritures admin invalident immédiatement. */
const REVALIDATE = 60;

type Collection<T> = { member?: T[]; 'hydra:member'?: T[]; totalItems?: number; 'hydra:totalItems'?: number };

/** Éléments d'une collection JSON-LD (préfixe hydra: selon la config de l'API). */
export const membres = <T>(data: Collection<T> | null | undefined): T[] => data?.member ?? data?.['hydra:member'] ?? [];

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Accept: 'application/ld+json' },
      next: { revalidate: REVALIDATE, tags: ['api'] },
    });
    if (!res.ok) {
      // 404 attendu (fiche inexistante → page 404 du site) : pas une erreur à signaler
      if (res.status !== 404) console.error(`API ${res.status} sur ${path}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (e) {
    // API injoignable : les pages affichent un état vide plutôt qu'une erreur.
    console.error(`API injoignable sur ${path} :`, e instanceof Error ? e.message : e);
    return null;
  }
}

async function getList<T>(path: string): Promise<T[]> {
  const sep = path.includes('?') ? '&' : '?';
  const data = await getJson<Collection<T>>(`${path}${sep}itemsPerPage=200`);
  return membres(data);
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

const aujourdhui = aujourdhuiParis;

/** Matchs non joués à partir d'aujourd'hui (heure de Paris). */
export const getProchainsMatchs = (query = '') =>
  getRencontres(`?date[after]=${aujourdhui()}&order[date]=asc&order[heure]=asc${query}`).then((r) =>
    r.filter((m) => m.scoreDom == null),
  );

/** Matchs joués, aujourd'hui inclus (un score saisi le jour même apparaît aussitôt). */
export const getDerniersResultats = (query = '') =>
  getRencontres(`?date[before]=${aujourdhui()}&order[date]=desc${query}`).then((r) =>
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
export const getParticipations = (equipeId: number) => getList<Participation>(`/api/participations?joueur.equipe=${equipeId}`);
