import type { Rencontre } from './types';

export const JOURS = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

/** Parse une date Y-m-d sans décalage de fuseau. */
export function parseDate(date: string): Date {
  const [y, m, d] = date.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const formatDateLongue = (date: string) =>
  parseDate(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

export const formatDateCourte = (date: string) =>
  parseDate(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

export const formatDatePub = (date: string) =>
  new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

export const formatHeure = (heure?: string | null) => (heure ? heure.slice(0, 5).replace(':', 'h') : '');

/** Équipes dans l'ordre officiel : recevant à gauche, visiteur à droite. */
export const recevant = (r: Rencontre) => (r.domicile ? r.equipe : r.equipeAdverse);
export const visiteur = (r: Rencontre) => (r.domicile ? r.equipeAdverse : r.equipe);

/** scoreDom = score du recevant. Retourne le résultat vu de l'AJSO (V/N/D). */
export function issue(r: Rencontre): { pour: number; contre: number; resultat: 'V' | 'N' | 'D' } | null {
  if (r.scoreDom == null || r.scoreExt == null) return null;
  const pour = r.domicile ? r.scoreDom : r.scoreExt;
  const contre = r.domicile ? r.scoreExt : r.scoreDom;
  return { pour, contre, resultat: pour > contre ? 'V' : pour === contre ? 'N' : 'D' };
}

export const extrait = (texte: string, max = 180) =>
  texte.length > max ? `${texte.slice(0, max).replace(/\s+\S*$/, '')}…` : texte;
