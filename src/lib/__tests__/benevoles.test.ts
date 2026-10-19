import { describe, expect, it } from 'vitest';
import { etatPermanence, nomsBenevoles, parWeekEnd, samediDuWeekEnd } from '../benevoles';

describe('bénévoles', () => {
  it('rattache chaque jour au samedi de son week-end', () => {
    expect(samediDuWeekEnd('2026-10-24')).toBe('2026-10-24'); // samedi
    expect(samediDuWeekEnd('2026-10-25')).toBe('2026-10-24'); // dimanche
    expect(samediDuWeekEnd('2026-10-21')).toBe('2026-10-24'); // mercredi
    expect(samediDuWeekEnd('2026-10-31')).toBe('2026-10-31');
    expect(samediDuWeekEnd('2026-11-01')).toBe('2026-10-31');
  });

  it('groupe par week-end dans l’ordre chronologique', () => {
    const g = parWeekEnd(['2026-11-01', '2026-10-24', '2026-10-31', '2026-10-25'], (d) => d);
    expect(g).toEqual([
      ['2026-10-24', ['2026-10-24', '2026-10-25']],
      ['2026-10-31', ['2026-10-31', '2026-11-01']],
    ]);
  });

  it('compte les noms et les places restantes', () => {
    expect(nomsBenevoles('Paul, Marie et Léo')).toEqual(['Paul', 'Marie', 'Léo']);
    expect(nomsBenevoles('Bernadette')).toEqual(['Bernadette']);
    expect(nomsBenevoles(null)).toEqual([]);
    expect(etatPermanence({ benevole: '', besoin: 2 })).toEqual({ noms: [], manquants: 2 });
    expect(etatPermanence({ benevole: 'Paul / Marie', besoin: 3 })).toEqual({ noms: ['Paul', 'Marie'], manquants: 1 });
    expect(etatPermanence({ benevole: 'Paul', besoin: 1 })).toEqual({ noms: ['Paul'], manquants: 0 });
  });
});
