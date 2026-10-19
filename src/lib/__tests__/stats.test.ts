import { describe, expect, it } from 'vitest';
import { bilan, statsJoueurs } from '../stats';
import type { Joueur, Participation } from '../types';
import { match } from './fixtures';

describe('bilan', () => {
  it('compte victoires, nuls, défaites et buts', () => {
    const b = bilan([
      match('2026-09-20', 30, 20),
      match('2026-09-27', 25, 25, false),
      match('2026-10-04', 18, 24),
      match('2026-10-11'), // pas encore joué : ignoré
    ]);
    expect(b).toMatchObject({ joues: 3, victoires: 1, nuls: 1, defaites: 1, butsPour: 73, butsContre: 69 });
  });

  it('forme et série du plus récent au plus ancien, quel que soit l’ordre reçu', () => {
    const b = bilan([
      match('2026-10-11', 30, 20),
      match('2026-09-13', 10, 20),
      match('2026-10-04', 28, 27),
      match('2026-09-27', 20, 20),
      match('2026-09-20', 21, 20),
      match('2026-10-18', 31, 20),
    ]);
    expect(b.forme).toEqual(['V', 'V', 'V', 'N', 'V']);
    expect(b.serie).toEqual({ resultat: 'V', longueur: 3 });
  });

  it('plus large victoire', () => {
    const large = match('2026-10-04', 35, 20, false);
    const b = bilan([match('2026-09-20', 30, 28), large, match('2026-10-11', 20, 30)]);
    expect(b.record).toBe(large);
  });

  it('aucun match joué', () => {
    expect(bilan([])).toMatchObject({ joues: 0, forme: [], serie: null, record: null });
  });

  it('pas de « plus large victoire » sans victoire', () => {
    expect(bilan([match('2026-09-20', 20, 30)]).record).toBeNull();
  });
});

describe('statsJoueurs', () => {
  const joueur = (id: number, nomAffiche: string): Joueur => ({ id, nomAffiche, prenom: nomAffiche, equipe: { id: 1, nom: 'Seniors' }, capitaine: false });
  const p = (j: Joueur, rencontre: string, buts: number, extra: Partial<Participation> = {}): Participation => ({ id: Math.random(), joueur: j, rencontre, buts, ...extra });

  it('cumule par joueur et trie par buts', () => {
    const lea = joueur(1, 'Léa M.');
    const zoe = joueur(2, 'Zoé B.');
    const s = statsJoueurs([
      p(lea, '/api/rencontres/1', 3, { buts7m: 1, tirs: 5, avertissement: true }),
      p(lea, '/api/rencontres/2', 7, { tirs: 9, exclusions: 1, disqualification: true }),
      p(zoe, '/api/rencontres/1', 12, { arrets: 2 }),
    ]);
    expect(s.map((x) => x.joueur.nomAffiche)).toEqual(['Zoé B.', 'Léa M.']);
    expect(s[1]).toMatchObject({ matchs: 2, buts: 10, moyenne: 5, record: 7, buts7m: 1, tirs: 14, exclusions: 1, cartons: 2 });
    expect(s[0]).toMatchObject({ matchs: 1, buts: 12, arrets: 2 });
  });

  it('départage à égalité de buts par moyenne puis par nom', () => {
    const a = joueur(1, 'Bob'), b = joueur(2, 'Alice'), c = joueur(3, 'Chloé');
    const s = statsJoueurs([p(a, 'r1', 4), p(b, 'r1', 2), p(b, 'r2', 2), p(c, 'r1', 4)]);
    expect(s.map((x) => x.joueur.nomAffiche)).toEqual(['Bob', 'Chloé', 'Alice']);
  });
});
