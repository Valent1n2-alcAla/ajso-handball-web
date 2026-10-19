import { afterEach, describe, expect, it, vi } from 'vitest';
import { bornesSaison, libelleSaison, lireSaison, saisonCourante, saisonDe, saisonsDisponibles } from '../saison';

afterEach(() => vi.useRealTimers());

describe('saisons', () => {
  it('commence le 1er août', () => {
    expect(saisonDe('2026-07-31')).toBe('2025-2026');
    expect(saisonDe('2026-08-01')).toBe('2026-2027');
    expect(saisonDe('2027-01-15')).toBe('2026-2027');
  });

  it('saison courante à l’heure de Paris', () => {
    vi.useFakeTimers();
    // 31 juillet 22h30 UTC = 1er août 0h30 à Paris
    vi.setSystemTime(new Date('2027-07-31T22:30:00Z'));
    expect(saisonCourante()).toBe('2027-2028');
    expect(saisonCourante('2026-10-19')).toBe('2026-2027');
  });

  it('bornes et libellé', () => {
    expect(bornesSaison('2025-2026')).toEqual({ debut: '2025-08-01', fin: '2026-07-31' });
    expect(libelleSaison('2025-2026')).toBe('2025–2026');
  });

  it('valide le paramètre d’URL', () => {
    expect(lireSaison('2025-2026')).toBe('2025-2026');
    expect(lireSaison('2025-2027')).toBeNull();
    expect(lireSaison('2025')).toBeNull();
    expect(lireSaison(['2025-2026'])).toBeNull();
    expect(lireSaison(undefined)).toBeNull();
  });

  it('liste jusqu’à la première saison du site, ou plus loin si des matchs existent', () => {
    expect(saisonsDisponibles('2026-2027')).toEqual(['2026-2027']);
    expect(saisonsDisponibles('2028-2029')).toEqual(['2028-2029', '2027-2028', '2026-2027']);
    expect(saisonsDisponibles('2026-2027', '2025-03-01')).toEqual(['2026-2027', '2025-2026', '2024-2025']);
    expect(saisonsDisponibles('2026-2027', '2026-09-01')).toEqual(['2026-2027']);
  });
});
