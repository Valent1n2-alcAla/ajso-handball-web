import { describe, expect, it } from 'vitest';
import { calendrierIcal, jourIcal, plierIcal, texteIcal } from '../ical';
import { match } from './fixtures';

const lignes = (ics: string) => ics.replace(/\r\n /g, '').split('\r\n');

describe('iCalendar', () => {
  it('échappe les caractères spéciaux', () => {
    expect(texteIcal('a;b,c\\d\ne')).toBe('a\;b\\,c\\\\d\\ne');
  });

  it('plie les lignes longues à 75 octets, sans couper un caractère', () => {
    const longue = `SUMMARY:${'é'.repeat(80)}`;
    const pliee = plierIcal(longue);
    for (const l of pliee.split('\r\n')) expect(new TextEncoder().encode(l).length).toBeLessThanOrEqual(75);
    expect(pliee.replace(/\r\n /g, '')).toBe(longue);
  });

  it('dates seules décalées', () => {
    expect(jourIcal('2026-12-31', 1)).toBe('20270101');
  });

  it('génère un match à l’heure de Paris (UTC dans le fichier)', () => {
    const ics = calendrierIcal('Seniors M', [match('2026-12-19', undefined, undefined, true, { id: 42, heure: '18:00', journee: 'J5', lieu: 'Gymnase, Ouistreham' })], new Date('2026-10-19T10:00:00Z'));
    const l = lignes(ics);
    expect(ics.endsWith('\r\n')).toBe(true);
    expect(l[0]).toBe('BEGIN:VCALENDAR');
    expect(l).toContain('UID:rencontre-42@ajso-handball');
    expect(l).toContain('DTSTART:20261219T170000Z');
    expect(l).toContain('DTEND:20261219T183000Z');
    expect(l).toContain('SUMMARY:AJSO Seniors M vs Caen HB');
    expect(l).toContain('LOCATION:Gymnase\\, Ouistreham');
    expect(l).toContain('DTSTAMP:20261019T100000Z');
  });

  it('week-end non confirmé : journées entières samedi-dimanche', () => {
    const l = lignes(calendrierIcal('S', [match('2026-11-21', undefined, undefined, false, { dateConfirmee: false })]));
    expect(l).toContain('DTSTART;VALUE=DATE:20261121');
    expect(l).toContain('DTEND;VALUE=DATE:20261123');
    expect(l).toContain('SUMMARY:Caen HB vs AJSO Seniors M (date à confirmer)');
  });

  it('score affiché une fois le match joué', () => {
    const l = lignes(calendrierIcal('S', [match('2026-10-03', 30, 25, false, { heure: '20:30' })]));
    expect(l).toContain('SUMMARY:Caen HB vs AJSO Seniors M (25-30)');
  });
});
