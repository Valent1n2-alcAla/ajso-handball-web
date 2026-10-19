import type { NextRequest } from 'next/server';
import { getEquipe, getRencontres } from '@/lib/api';
import { calendrierIcal } from '@/lib/ical';

/** Calendrier iCal d'une équipe, à importer ou à suivre dans un agenda (Google, Apple, Outlook). */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^\d+$/.test(id)) return new Response('Équipe introuvable', { status: 404 });
  const equipe = await getEquipe(id);
  if (!equipe || !equipe.estAjso) return new Response('Équipe introuvable', { status: 404 });

  const matchs = await getRencontres(`?equipe=${equipe.id}&order[date]=asc&order[heure]=asc`);
  return new Response(calendrierIcal(equipe.nom, matchs), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="ajso-equipe-${equipe.id}.ics"`,
    },
  });
}
