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

/** « Week-end du 21-22 nov. » à partir du samedi. */
export function formatWeekEnd(date: string): string {
  const sam = parseDate(date);
  const dim = new Date(sam.getFullYear(), sam.getMonth(), sam.getDate() + 1);
  const mois = (d: Date) => d.toLocaleDateString('fr-FR', { month: 'short' });
  return sam.getMonth() === dim.getMonth()
    ? `Week-end du ${sam.getDate()}-${dim.getDate()} ${mois(dim)}`
    : `Week-end du ${sam.getDate()} ${mois(sam)} au ${dim.getDate()} ${mois(dim)}`;
}

/** Date lisible d'un match, au week-end près si le jour n'est pas fixé. */
export const formatDateMatch = (r: Rencontre) =>
  r.dateConfirmee === false ? formatWeekEnd(r.date) : formatDateLongue(r.date);

export const formatHoraire = (r: Rencontre) =>
  r.dateConfirmee === false ? 'Date à confirmer' : r.heure ? formatHeure(r.heure) : 'Horaire à venir';

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

/** « 2026-12-13T09:00 » (heure locale, sans fuseau) → Date locale. */
export function parseDateHeure(valeur: string): Date {
  const [d, h = '00:00'] = valeur.split('T');
  const [y, m, j] = d.split('-').map(Number);
  const [hh, mm] = h.split(':').map(Number);
  return new Date(y, m - 1, j, hh, mm);
}

/** « Sam. 13 déc. · 9h00 – 17h00 » ou « 15 → 17 févr. » pour plusieurs jours. */
export function formatPeriode(debut: string, fin?: string | null): string {
  const d = parseDateHeure(debut);
  const jour = (x: Date) => x.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  const heure = (x: Date) => `${x.getHours()}h${String(x.getMinutes()).padStart(2, '0')}`;
  if (!fin) return `${jour(d)} · ${heure(d)}`;
  const f = parseDateHeure(fin);
  return d.toDateString() === f.toDateString()
    ? `${jour(d)} · ${heure(d)} – ${heure(f)}`
    : `${jour(d)} → ${jour(f)}`;
}

export const TYPES_COMPETITION: Record<string, string> = {
  championnat: 'Championnat', 'phase-1': 'Phase 1', 'phase-2': 'Phase 2', coupe: 'Coupe',
};

/** « Championnat Plus 16 ans… » ou « Phase 2 · -15 Garçons… » */
export const nomCompetition = (c: { nom: string; type?: string }) =>
  c.type && c.type !== 'championnat' ? `${TYPES_COMPETITION[c.type] ?? c.type} · ${c.nom}` : c.nom;

/** Toutes les compétitions d'une équipe, principale en premier. */
export function competitionsEquipe<C extends { id: number }>(e: { championnat?: C | null; competitions?: C[] }): C[] {
  const liste = [e.championnat, ...(e.competitions ?? [])].filter((c): c is C => !!c);
  return liste.filter((c, i) => liste.findIndex((x) => x.id === c.id) === i);
}

export const TYPES_EVENEMENT: Record<string, string> = {
  tournoi: 'Tournoi', stage: 'Stage', festif: 'Festif', assemblee: 'Vie du club', evenement: 'Événement',
};

export const formatPrix = (prix: number) =>
  prix.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: Number.isInteger(prix) ? 0 : 2 });
