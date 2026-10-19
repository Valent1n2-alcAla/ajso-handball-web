import type { Rencontre } from './types';

export const JOURS = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

/** Fuseau du club : toutes les dates sont affichées et calculées à l'heure de Paris. */
export const FUSEAU = 'Europe/Paris';

/** Date du jour à Paris (AAAA-MM-JJ), quel que soit le fuseau du serveur. */
export const aujourdhuiParis = () => new Date().toLocaleDateString('sv-SE', { timeZone: FUSEAU });

/** Date et heure courantes à Paris au format des champs datetime-local (AAAA-MM-JJTHH:MM). */
export const maintenantParis = () => new Date().toLocaleString('sv-SE', { timeZone: FUSEAU }).replace(' ', 'T').slice(0, 16);

/** Écart (ms) entre l'heure de Paris et UTC à un instant donné. */
function decalageParis(t: number): number {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone: FUSEAU, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })
      .formatToParts(t).map((x) => [x.type, x.value]),
  );
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute) - Math.floor(t / 60000) * 60000;
}

/** Instant correspondant à une heure murale de Paris (gère l'heure d'été). */
export function instantParis(y: number, m: number, j: number, h = 0, min = 0): Date {
  const mural = Date.UTC(y, m - 1, j, h, min);
  let t = mural - decalageParis(mural);
  const corrige = mural - decalageParis(t);
  if (corrige !== t) t = corrige;
  return new Date(t);
}

/** Parse une date Y-m-d (midi UTC : même jour à Paris quel que soit le fuseau du serveur). */
export function parseDate(date: string): Date {
  const [y, m, d] = date.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

export const formatDateLongue = (date: string) =>
  parseDate(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: FUSEAU });

export const formatDateCourte = (date: string) =>
  parseDate(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', timeZone: FUSEAU });

export const formatDatePub = (date: string) =>
  new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: FUSEAU });

export const formatHeure = (heure?: string | null) => (heure ? heure.slice(0, 5).replace(':', 'h') : '');

/** « Week-end du 21-22 nov. » à partir du samedi. */
export function formatWeekEnd(date: string): string {
  const sam = parseDate(date);
  const dim = new Date(sam.getTime() + 86400000);
  const mois = (d: Date) => d.toLocaleDateString('fr-FR', { month: 'short', timeZone: FUSEAU });
  return sam.getUTCMonth() === dim.getUTCMonth()
    ? `Week-end du ${sam.getUTCDate()}-${dim.getUTCDate()} ${mois(dim)}`
    : `Week-end du ${sam.getUTCDate()} ${mois(sam)} au ${dim.getUTCDate()} ${mois(dim)}`;
}

/** Date lisible d'un match, au week-end près si le jour n'est pas fixé. */
export const formatDateMatch = (r: Pick<Rencontre, 'date' | 'dateConfirmee'>) =>
  r.dateConfirmee === false ? formatWeekEnd(r.date) : formatDateLongue(r.date);

export const formatHoraire = (r: Pick<Rencontre, 'dateConfirmee' | 'heure'>) =>
  r.dateConfirmee === false ? 'Date à confirmer' : r.heure ? formatHeure(r.heure) : 'Horaire à venir';

/** Équipes dans l'ordre officiel : recevant à gauche, visiteur à droite. */
type Affiche = Pick<Rencontre, 'domicile' | 'equipe' | 'equipeAdverse'>;
export const recevant = (r: Affiche) => (r.domicile ? r.equipe : r.equipeAdverse);
export const visiteur = (r: Affiche) => (r.domicile ? r.equipeAdverse : r.equipe);

/** scoreDom = score du recevant. Retourne le résultat vu de l'AJSO (V/N/D). */
export function issue(r: Rencontre): { pour: number; contre: number; resultat: 'V' | 'N' | 'D' } | null {
  if (r.scoreDom == null || r.scoreExt == null) return null;
  const pour = r.domicile ? r.scoreDom : r.scoreExt;
  const contre = r.domicile ? r.scoreExt : r.scoreDom;
  return { pour, contre, resultat: pour > contre ? 'V' : pour === contre ? 'N' : 'D' };
}

export const extrait = (texte: string, max = 180) =>
  texte.length > max ? `${texte.slice(0, max).replace(/\s+\S*$/, '')}…` : texte;

/** « 2026-12-13T09:00 » (heure de Paris, sans fuseau) → instant. */
export function parseDateHeure(valeur: string): Date {
  const [d, h = '00:00'] = valeur.split('T');
  const [y, m, j] = d.split('-').map(Number);
  const [hh, mm] = h.split(':').map(Number);
  return instantParis(y, m, j, hh, mm);
}

/** « Sam. 13 déc. · 9h00 – 17h00 » ou « 15 → 17 févr. » pour plusieurs jours. */
export function formatPeriode(debut: string, fin?: string | null): string {
  const d = parseDateHeure(debut);
  const jour = (x: Date) => x.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: FUSEAU });
  const heure = (x: Date) => x.toLocaleTimeString('fr-FR', { hour: 'numeric', minute: '2-digit', timeZone: FUSEAU }).replace(':', 'h');
  const cle = (x: Date) => x.toLocaleDateString('sv-SE', { timeZone: FUSEAU });
  if (!fin) return `${jour(d)} · ${heure(d)}`;
  const f = parseDateHeure(fin);
  return cle(d) === cle(f)
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
