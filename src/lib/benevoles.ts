import { parseDate } from './format';
import type { Permanence, RolePermanence } from './types';

export const ROLES_PERMANENCE: Record<RolePermanence, string> = {
  arbitrage: 'Arbitrage',
  table: 'Table de marque',
  buvette: 'Buvette',
  accueil: 'Accueil',
  autre: 'Autre',
};

/** Ordre d'affichage des rôles. */
const ORDRE_ROLES: RolePermanence[] = ['arbitrage', 'table', 'accueil', 'buvette', 'autre'];

/** Noms saisis dans le champ bénévole (« Paul, Marie et Léo » → 3 noms). */
export function nomsBenevoles(benevole?: string | null): string[] {
  return (benevole ?? '')
    .split(/\s*(?:[,;/&+]|\bet\b)\s*/)
    .map((n) => n.trim())
    .filter(Boolean);
}

/** Personnes inscrites et places restantes d'une permanence. */
export function etatPermanence(p: Pick<Permanence, 'benevole' | 'besoin'>): { noms: string[]; manquants: number } {
  const noms = nomsBenevoles(p.benevole);
  return { noms, manquants: Math.max(0, (p.besoin || 1) - noms.length) };
}

/** Samedi du week-end d'une date (le dimanche est rattaché à la veille ; en semaine, au samedi suivant). */
export function samediDuWeekEnd(date: string): string {
  const d = parseDate(date);
  const jour = d.getUTCDay(); // 0 = dimanche … 6 = samedi
  const decalage = jour === 0 ? -1 : 6 - jour;
  return new Date(d.getTime() + decalage * 86400000).toISOString().slice(0, 10);
}

/** Regroupe des éléments par week-end (clé : samedi), dans l'ordre chronologique. */
export function parWeekEnd<T>(items: T[], date: (t: T) => string): [string, T[]][] {
  const groupes = new Map<string, T[]>();
  for (const it of [...items].sort((a, b) => date(a).localeCompare(date(b)))) {
    const cle = samediDuWeekEnd(date(it));
    groupes.set(cle, [...(groupes.get(cle) ?? []), it]);
  }
  return [...groupes.entries()];
}

/** Permanences d'un match, rôles dans l'ordre habituel. */
export const trierPermanences = (liste: Permanence[]) =>
  [...liste].sort((a, b) => ORDRE_ROLES.indexOf(a.role) - ORDRE_ROLES.indexOf(b.role));
