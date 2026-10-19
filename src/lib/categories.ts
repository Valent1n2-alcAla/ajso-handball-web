import type { CSSProperties } from 'react';
import type { Equipe } from './types';

/** Couleur d'accent par tranche d'âge : bleu roi (adultes), violet (jeunes), jaune (école de hand). */
const COULEURS: Record<string, { fond: string; texte: string; libelle: string }> = {
  Adultes: { fond: '#2340c8', texte: '#ffffff', libelle: 'Adultes' },
  Jeunes: { fond: '#6b2fa8', texte: '#ffffff', libelle: 'Jeunes' },
  'École de hand': { fond: '#ffc629', texte: '#0a0f3c', libelle: 'École de hand' },
};
const DEFAUT = { fond: '#9fd8ff', texte: '#0a0f3c', libelle: 'Équipe' };

export const couleurTranche = (tranche?: string | null) => (tranche && COULEURS[tranche]) || DEFAUT;

/** Variables CSS --cat (fond) et --cat-texte pour styler une carte d'équipe (`bg-(--cat)`, `text-(--cat-texte)`). */
export function styleCategorie(e: Pick<Equipe, 'categorie'>): CSSProperties {
  const c = couleurTranche(e.categorie?.tranche?.nom);
  return { '--cat': c.fond, '--cat-texte': c.texte } as CSSProperties;
}
