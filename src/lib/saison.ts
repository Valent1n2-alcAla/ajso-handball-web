import { aujourdhuiParis } from './format';

/**
 * Saisons sportives : du 1er août au 31 juillet, notées « 2026-2027 ».
 * Les dates sont des chaînes AAAA-MM-JJ (heure de Paris).
 */

/** Première saison couverte par le site : le sélecteur ne remonte pas plus loin sans données. */
export const PREMIERE_SAISON = '2026-2027';

/** Saison d'une date AAAA-MM-JJ. */
export function saisonDe(date: string): string {
  const annee = Number(date.slice(0, 4));
  const mois = Number(date.slice(5, 7));
  const debut = mois >= 8 ? annee : annee - 1;
  return `${debut}-${debut + 1}`;
}

/** Saison en cours, calculée à l'heure de Paris. */
export const saisonCourante = (aujourdhui = aujourdhuiParis()) => saisonDe(aujourdhui);

/** « 2026-2027 » valide (deux années consécutives) ou null. */
export function lireSaison(valeur: unknown): string | null {
  if (typeof valeur !== 'string') return null;
  const m = /^(\d{4})-(\d{4})$/.exec(valeur);
  if (!m || Number(m[2]) !== Number(m[1]) + 1) return null;
  return valeur;
}

/** Premier et dernier jour d'une saison. */
export function bornesSaison(saison: string): { debut: string; fin: string } {
  const debut = Number(saison.slice(0, 4));
  return { debut: `${debut}-08-01`, fin: `${debut + 1}-07-31` };
}

/** « Saison 2026–2027 » */
export const libelleSaison = (saison: string) => saison.replace('-', '–');

/**
 * Saisons proposées, de la plus récente à la plus ancienne : de la saison en cours
 * jusqu'à la première saison du site, ou plus loin si des matchs plus anciens existent.
 */
export function saisonsDisponibles(courante: string, plusAncienneDate?: string | null): string[] {
  const plancher = Math.min(
    Number(PREMIERE_SAISON.slice(0, 4)),
    plusAncienneDate ? Number(saisonDe(plusAncienneDate).slice(0, 4)) : Infinity,
  );
  const liste: string[] = [];
  for (let a = Number(courante.slice(0, 4)); a >= plancher && liste.length < 30; a--) liste.push(`${a}-${a + 1}`);
  return liste;
}
