import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  aujourdhuiParis, competitionsEquipe, extrait, formatDateCourte, formatDateLongue, formatHeure, formatHoraire, formatPeriode, formatPrix,
  formatWeekEnd, instantParis, issue, maintenantParis, nomCompetition, parseDate, parseDateHeure, recevant, visiteur,
} from '../format';
import { match } from './fixtures';

afterEach(() => vi.useRealTimers());

describe('heure de Paris', () => {
  it('aujourdhuiParis suit le jour à Paris, pas celui du serveur', () => {
    vi.useFakeTimers();
    // 23h30 UTC le 31 décembre = 0h30 le 1er janvier à Paris
    vi.setSystemTime(new Date('2026-12-31T23:30:00Z'));
    expect(aujourdhuiParis()).toBe('2027-01-01');
    expect(maintenantParis()).toBe('2027-01-01T00:30');
  });

  it('instantParis gère heure d’hiver et heure d’été', () => {
    expect(instantParis(2026, 12, 19, 18, 0).toISOString()).toBe('2026-12-19T17:00:00.000Z');
    expect(instantParis(2026, 7, 4, 18, 0).toISOString()).toBe('2026-07-04T16:00:00.000Z');
    expect(parseDateHeure('2026-03-29T10:00').toISOString()).toBe('2026-03-29T08:00:00.000Z');
  });

  it('parseDate garde le jour quel que soit le fuseau', () => {
    expect(parseDate('2026-11-21').toISOString().slice(0, 10)).toBe('2026-11-21');
    expect(parseDate('2026-11-21T00:00:00+01:00').getUTCDate()).toBe(21);
  });
});

describe('formats', () => {
  it('dates et heures en français', () => {
    expect(formatDateLongue('2026-11-21')).toBe('samedi 21 novembre');
    expect(formatDateCourte('2026-11-21')).toBe('21 nov.');
    expect(formatHeure('18:30:00')).toBe('18h30');
    expect(formatHeure(null)).toBe('');
  });

  it('week-end sur un ou deux mois', () => {
    expect(formatWeekEnd('2026-11-21')).toBe('Week-end du 21-22 nov.');
    expect(formatWeekEnd('2026-10-31')).toBe('Week-end du 31 oct. au 1 nov.');
  });

  it('horaire d’un match', () => {
    expect(formatHoraire(match('2026-11-21', undefined, undefined, true, { heure: '20:45' }))).toBe('20h45');
    expect(formatHoraire(match('2026-11-21'))).toBe('Horaire à venir');
    expect(formatHoraire(match('2026-11-21', undefined, undefined, true, { dateConfirmee: false, heure: '20:45' }))).toBe('Date à confirmer');
  });

  it('période d’un événement', () => {
    expect(formatPeriode('2026-12-13T09:00', '2026-12-13T17:00')).toBe('dim. 13 déc. · 9h00 – 17h00');
    expect(formatPeriode('2027-02-15T09:00', '2027-02-17T17:00')).toBe('lun. 15 févr. → mer. 17 févr.');
  });

  it('prix, extraits et compétitions', () => {
    expect(formatPrix(120).replace(/\s/g, ' ')).toBe('120 €');
    expect(formatPrix(12.5).replace(/\s/g, ' ')).toBe('12,50 €');
    expect(extrait('court')).toBe('court');
    expect(extrait('un deux trois quatre', 10)).toBe('un deux…');
    expect(nomCompetition({ nom: 'Excellence', type: 'phase-2' })).toBe('Phase 2 · Excellence');
    expect(nomCompetition({ nom: 'Excellence', type: 'championnat' })).toBe('Excellence');
    const c1 = { id: 1 }, c2 = { id: 2 };
    expect(competitionsEquipe({ championnat: c1, competitions: [c2, c1] })).toEqual([c1, c2]);
  });
});

describe('issue d’un match', () => {
  it('vu de l’AJSO, à domicile ou à l’extérieur', () => {
    expect(issue(match('2026-10-03', 30, 25, true))).toEqual({ pour: 30, contre: 25, resultat: 'V' });
    expect(issue(match('2026-10-03', 22, 28, false))).toEqual({ pour: 22, contre: 28, resultat: 'D' });
    expect(issue(match('2026-10-03', 20, 20, false))?.resultat).toBe('N');
    expect(issue(match('2026-10-03'))).toBeNull();
  });

  it('recevant à gauche, visiteur à droite', () => {
    const m = match('2026-10-03', 1, 0, false);
    expect(recevant(m).nom).toBe('Caen HB');
    expect(visiteur(m).nom).toBe('Seniors M');
  });
});
