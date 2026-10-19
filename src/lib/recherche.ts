import type { Actualite } from './types';

/** Texte normalisé pour la recherche : minuscules, sans accents. */
export const normaliser = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/** Articles contenant tous les mots de la requête (titre, extrait ou contenu), sans tenir compte des accents. */
export function rechercherActualites(actus: Actualite[], requete: string): Actualite[] {
  const mots = normaliser(requete).split(/\s+/).filter(Boolean);
  if (!mots.length) return actus;
  return actus.filter((a) => {
    const texte = normaliser(`${a.titre} ${a.extrait ?? ''} ${a.contenu}`);
    return mots.every((m) => texte.includes(m));
  });
}
