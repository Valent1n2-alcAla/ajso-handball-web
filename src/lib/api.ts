import type {
  Actualite, Album, Club, Convocation, Creneau, DocumentClub, Equipe, Evenement, Gymnase, Joueur, LigneClassement, Participation, Partenaire, Permanence, Produit, Rencontre, Tarif,
} from './types';
import { aujourdhuiParis } from './format';
import { bornesSaison } from './saison';

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

/** Taille de page maximale acceptée par l'API. */
const PAR_PAGE = 200;
/** Garde-fou : au-delà, la liste est tronquée (2 000 éléments). */
const PAGES_MAX = 10;

/** Liste complète : les pages suivantes sont chargées si la collection dépasse 200 éléments. */
async function getList<T>(path: string): Promise<T[]> {
  const sep = path.includes('?') ? '&' : '?';
  const premiere = await getJson<Collection<T>>(`${path}${sep}itemsPerPage=${PAR_PAGE}`);
  const items = membres(premiere);
  const total = premiere?.totalItems ?? premiere?.['hydra:totalItems'] ?? items.length;
  const pages = Math.min(Math.ceil(total / PAR_PAGE), PAGES_MAX);
  if (pages <= 1) return items;
  const suite = await Promise.all(
    Array.from({ length: pages - 1 }, (_, i) => getJson<Collection<T>>(`${path}${sep}itemsPerPage=${PAR_PAGE}&page=${i + 2}`)),
  );
  return [...items, ...suite.flatMap((d) => membres(d))];
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

/** Matchs joués d'une saison (« 2025-2026 »), du plus récent au plus ancien ; la saison en cours s'arrête à aujourd'hui. */
export function getResultatsSaison(saison: string, query = '') {
  const { debut, fin } = bornesSaison(saison);
  const auj = aujourdhui();
  const jusqua = fin < auj ? fin : auj;
  return getRencontres(`?date[after]=${debut}&date[before]=${jusqua}&order[date]=desc${query}`).then((r) =>
    r.filter((m) => m.scoreDom != null),
  );
}

/** Date du plus ancien match enregistré (toutes équipes ou une seule), pour proposer les saisons archivées. */
export async function getDatePremierMatch(query = ''): Promise<string | null> {
  const data = await getJson<Collection<Rencontre>>(`/api/rencontres?order[date]=asc&itemsPerPage=1${query}`);
  return membres(data)[0]?.date ?? null;
}

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

/** Convocations publiées des matchs à venir d'une équipe (les brouillons ne sont pas servis au public). */
export const getConvocationsAVenir = (equipeId: number) =>
  getList<Convocation>(`/api/convocations?rencontre.equipe=${equipeId}&rencontre.date[after]=${aujourdhui()}`);

/** Permanences (arbitrage, table, buvette…) des matchs à venir. */
export const getPermanencesAVenir = () => getList<Permanence>(`/api/permanences?rencontre.date[after]=${aujourdhui()}`);

export const getDocuments = () => getList<DocumentClub>('/api/documents');
