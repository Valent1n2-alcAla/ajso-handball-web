import { issue } from './format';
import type { Joueur, Participation, Rencontre } from './types';

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

export type StatJoueur = {
  joueur: Joueur; matchs: number; buts: number; moyenne: number; record: number;
  buts7m: number; tirs: number; arrets: number; exclusions: number; cartons: number;
};

/** Statistiques individuelles à partir des compositions de match, meilleurs buteurs en premier. */
export function statsJoueurs(participations: Participation[]): StatJoueur[] {
  const parJoueur = new Map<number, StatJoueur & { rencontres: Set<string> }>();
  for (const p of participations) {
    const s = parJoueur.get(p.joueur.id) ?? { joueur: p.joueur, matchs: 0, buts: 0, moyenne: 0, record: 0, buts7m: 0, tirs: 0, arrets: 0, exclusions: 0, cartons: 0, rencontres: new Set<string>() };
    s.rencontres.add(p.rencontre);
    s.buts += p.buts;
    s.record = Math.max(s.record, p.buts);
    s.buts7m += p.buts7m ?? 0;
    s.tirs += p.tirs ?? 0;
    s.arrets += p.arrets ?? 0;
    s.exclusions += p.exclusions ?? 0;
    s.cartons += (p.avertissement ? 1 : 0) + (p.disqualification ? 1 : 0);
    parJoueur.set(p.joueur.id, s);
  }
  return [...parJoueur.values()]
    .map(({ rencontres, ...s }) => ({ ...s, matchs: rencontres.size, moyenne: rencontres.size ? s.buts / rencontres.size : 0 }))
    .sort((a, b) => b.buts - a.buts || b.moyenne - a.moyenne || a.joueur.nomAffiche.localeCompare(b.joueur.nomAffiche));
}
