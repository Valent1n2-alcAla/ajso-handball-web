import { instantParis } from './format';
import type { Rencontre } from './types';

/** Durée affichée d'un match dans l'agenda. */
const DUREE_MATCH = 90 * 60000;

/** Échappement des textes iCalendar (RFC 5545 §3.3.11). */
export const texteIcal = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Instant UTC au format iCalendar : 20261219T170000Z */
export const utcIcal = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/** Date seule : 20261219 (à partir de AAAA-MM-JJ, éventuellement décalée de n jours). */
export function jourIcal(date: string, plus = 0): string {
  const [y, m, j] = date.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, j + plus)).toISOString().slice(0, 10).replace(/-/g, '');
}

/** Plie les lignes à 75 octets (RFC 5545 §3.1). */
export function plierIcal(ligne: string): string {
  const enc = new TextEncoder();
  const morceaux: string[] = [];
  let courant = '';
  let octets = 0;
  for (const c of ligne) {
    const n = enc.encode(c).length;
    if (octets + n > (morceaux.length ? 74 : 75)) {
      morceaux.push(courant);
      courant = '';
      octets = 0;
    }
    courant += c;
    octets += n;
  }
  morceaux.push(courant);
  return morceaux.join('\r\n ');
}

function evenement(r: Rencontre, maintenant: string): string[] {
  const adverse = r.equipeAdverse.nom;
  const nous = `AJSO ${r.equipe.nom}`;
  const resume = r.domicile ? `${nous} vs ${adverse}` : `${adverse} vs ${nous}`;
  const score = r.scoreDom != null && r.scoreExt != null ? ` (${r.scoreDom}-${r.scoreExt})` : '';
  const lignes = ['BEGIN:VEVENT', `UID:rencontre-${r.id}@ajso-handball`, `DTSTAMP:${maintenant}`];

  if (r.dateConfirmee === false) {
    // Seul le week-end est connu : samedi et dimanche, journée entière
    lignes.push(`DTSTART;VALUE=DATE:${jourIcal(r.date)}`, `DTEND;VALUE=DATE:${jourIcal(r.date, 2)}`, `SUMMARY:${texteIcal(`${resume} (date à confirmer)`)}`);
  } else if (r.heure) {
    const [y, m, j] = r.date.slice(0, 10).split('-').map(Number);
    const [hh, mm] = r.heure.split(':').map(Number);
    const debut = instantParis(y, m, j, hh, mm);
    lignes.push(`DTSTART:${utcIcal(debut)}`, `DTEND:${utcIcal(new Date(debut.getTime() + DUREE_MATCH))}`, `SUMMARY:${texteIcal(resume + score)}`);
  } else {
    lignes.push(`DTSTART;VALUE=DATE:${jourIcal(r.date)}`, `DTEND;VALUE=DATE:${jourIcal(r.date, 1)}`, `SUMMARY:${texteIcal(resume + score)}`);
  }

  if (r.lieu) lignes.push(`LOCATION:${texteIcal(r.lieu)}`);
  const details = [r.championnat?.nom, r.journee ? `Journée ${r.journee}` : '', r.domicile ? 'À domicile' : 'À l\'extérieur'].filter(Boolean).join(' · ');
  if (details) lignes.push(`DESCRIPTION:${texteIcal(details)}`);
  lignes.push('END:VEVENT');
  return lignes;
}

/** Calendrier iCalendar complet (lignes CRLF, pliées) des matchs d'une équipe. */
export function calendrierIcal(nomEquipe: string, matchs: Rencontre[], maintenant = new Date()): string {
  const stamp = utcIcal(maintenant);
  const lignes = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AJSO Handball//Calendrier//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${texteIcal(`AJSO ${nomEquipe}`)}`,
    'X-WR-TIMEZONE:Europe/Paris',
    ...matchs.flatMap((r) => evenement(r, stamp)),
    'END:VCALENDAR',
  ];
  return lignes.map(plierIcal).join('\r\n') + '\r\n';
}
