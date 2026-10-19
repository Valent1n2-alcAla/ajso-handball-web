import type { NextRequest } from 'next/server';
import { getEquipe, getRencontres } from '@/lib/api';
import { instantParis } from '@/lib/format';
import type { Rencontre } from '@/lib/types';

/** Durée affichée d'un match dans l'agenda. */
const DUREE_MATCH = 90 * 60000;

/** Échappement des textes iCalendar (RFC 5545 §3.3.11). */
const texte = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Instant UTC au format iCalendar : 20261219T170000Z */
const utc = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/** Date seule : 20261219 (à partir de AAAA-MM-JJ, éventuellement décalée de n jours). */
function jour(date: string, plus = 0): string {
  const [y, m, j] = date.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, j + plus)).toISOString().slice(0, 10).replace(/-/g, '');
}

/** Plie les lignes à 75 octets (RFC 5545 §3.1). */
function plier(ligne: string): string {
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
    lignes.push(`DTSTART;VALUE=DATE:${jour(r.date)}`, `DTEND;VALUE=DATE:${jour(r.date, 2)}`, `SUMMARY:${texte(`${resume} (date à confirmer)`)}`);
  } else if (r.heure) {
    const [y, m, j] = r.date.slice(0, 10).split('-').map(Number);
    const [hh, mm] = r.heure.split(':').map(Number);
    const debut = instantParis(y, m, j, hh, mm);
    lignes.push(`DTSTART:${utc(debut)}`, `DTEND:${utc(new Date(debut.getTime() + DUREE_MATCH))}`, `SUMMARY:${texte(resume + score)}`);
  } else {
    lignes.push(`DTSTART;VALUE=DATE:${jour(r.date)}`, `DTEND;VALUE=DATE:${jour(r.date, 1)}`, `SUMMARY:${texte(resume + score)}`);
  }

  if (r.lieu) lignes.push(`LOCATION:${texte(r.lieu)}`);
  const details = [r.championnat?.nom, r.journee ? `Journée ${r.journee}` : '', r.domicile ? 'À domicile' : 'À l\'extérieur'].filter(Boolean).join(' · ');
  if (details) lignes.push(`DESCRIPTION:${texte(details)}`);
  lignes.push('END:VEVENT');
  return lignes;
}

/** Calendrier iCal d'une équipe, à importer ou à suivre dans un agenda (Google, Apple, Outlook). */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^\d+$/.test(id)) return new Response('Équipe introuvable', { status: 404 });
  const equipe = await getEquipe(id);
  if (!equipe || !equipe.estAjso) return new Response('Équipe introuvable', { status: 404 });

  const matchs = await getRencontres(`?equipe=${equipe.id}&order[date]=asc&order[heure]=asc`);
  const maintenant = utc(new Date());
  const lignes = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AJSO Handball//Calendrier//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${texte(`AJSO ${equipe.nom}`)}`,
    'X-WR-TIMEZONE:Europe/Paris',
    ...matchs.flatMap((r) => evenement(r, maintenant)),
    'END:VCALENDAR',
  ];

  return new Response(lignes.map(plier).join('\r\n') + '\r\n', {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="ajso-equipe-${equipe.id}.ics"`,
    },
  });
}
