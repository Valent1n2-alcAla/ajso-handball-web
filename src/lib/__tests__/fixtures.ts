import type { Equipe, Rencontre } from '../types';

const nous: Equipe = { id: 1, nom: 'Seniors M', estAjso: true };
const eux = (nom = 'Caen HB'): Equipe => ({ id: 2, nom, estAjso: false });

/** Match AJSO : `pour`/`contre` vus de l'AJSO, converti en scores recevant/visiteur. */
export function match(date: string, pour?: number, contre?: number, domicile = true, extra: Partial<Rencontre> = {}): Rencontre {
  const joue = pour != null && contre != null;
  return {
    id: Math.floor(Math.random() * 1e6),
    equipe: nous,
    equipeAdverse: eux(),
    date,
    lieu: 'Gymnase',
    domicile,
    scoreDom: joue ? (domicile ? pour : contre) : null,
    scoreExt: joue ? (domicile ? contre : pour) : null,
    ...extra,
  };
}
