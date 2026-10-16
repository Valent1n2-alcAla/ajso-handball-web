import { issue } from './format';
import type { Rencontre } from './types';

export type Resultat = 'V' | 'N' | 'D';

export type Bilan = {
  joues: number;
  victoires: number;
  nuls: number;
  defaites: number;
  butsPour: number;
  butsContre: number;
  /** 5 derniers résultats, du plus récent au plus ancien */
  forme: Resultat[];
  /** Série en cours, ex. { resultat: 'V', longueur: 3 } */
  serie: { resultat: Resultat; longueur: number } | null;
  /** Plus large victoire */
  record: Rencontre | null;
};

/** Bilan d'une équipe à partir de ses matchs joués (ordre quelconque). */
export function bilan(matchs: Rencontre[]): Bilan {
  const joues = matchs
    .map((r) => ({ r, i: issue(r) }))
    .filter((x): x is { r: Rencontre; i: NonNullable<ReturnType<typeof issue>> } => x.i !== null)
    .sort((a, b) => b.r.date.localeCompare(a.r.date));

  const b: Bilan = { joues: joues.length, victoires: 0, nuls: 0, defaites: 0, butsPour: 0, butsContre: 0, forme: [], serie: null, record: null };
  let ecartMax = 0;
  for (const { r, i } of joues) {
    b.butsPour += i.pour;
    b.butsContre += i.contre;
    if (i.resultat === 'V') b.victoires++;
    else if (i.resultat === 'N') b.nuls++;
    else b.defaites++;
    if (i.pour - i.contre > ecartMax) { ecartMax = i.pour - i.contre; b.record = r; }
  }
  b.forme = joues.slice(0, 5).map((x) => x.i.resultat);
  if (joues.length) {
    const premier = joues[0].i.resultat;
    let n = 0;
    while (n < joues.length && joues[n].i.resultat === premier) n++;
    b.serie = { resultat: premier, longueur: n };
  }
  return b;
}

export const LIBELLE_SERIE: Record<Resultat, [string, string]> = {
  V: ['victoire', 'victoires'],
  N: ['nul', 'nuls'],
  D: ['défaite', 'défaites'],
};
