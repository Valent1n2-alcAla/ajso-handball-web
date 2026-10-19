import Link from 'next/link';
import Logo from './Logo';
import { formatDateMatch, formatHeure, formatHoraire, issue, recevant, visiteur, nomCompetition, parseDate, FUSEAU } from '@/lib/format';
import type { Equipe, Rencontre } from '@/lib/types';

type Res = 'V' | 'N' | 'D';
const libelleResultat: Record<Res, string> = { V: 'Victoire', N: 'Nul', D: 'Défaite' };
/** Pastille de résultat (texte blanc / nuit : contraste AA). */
export const PASTILLE: Record<Res, string> = { V: 'bg-victoire text-white', N: 'bg-jaune text-nuit', D: 'bg-defaite text-white' };

const nomAffiche = (e: Equipe) => (e.estAjso ? `AJSO ${e.nom}` : e.nom);
const competition = (r: Rencontre) => {
  const c = r.championnat ?? r.equipe.championnat;
  return c ? nomCompetition(c) : null;
};

/** Pastille V / N / D. */
export function PastilleResultat({ r }: { r: Rencontre }) {
  const res = issue(r);
  if (!res) return null;
  return (
    <span title={libelleResultat[res.resultat]} className={`inline-flex items-center justify-center w-6 h-6 font-display text-[13px] ${PASTILLE[res.resultat]}`}>
      <span aria-hidden>{res.resultat}</span><span className="sr-only">{libelleResultat[res.resultat]}</span>
    </span>
  );
}

/** Encadré « prochain match » : affiche, date, heure et lieu. */
export function CarteMatch({ r, titre = 'Prochain match' }: { r: Rencontre; titre?: string }) {
  const rec = recevant(r), vis = visiteur(r);
  const comp = competition(r);
  const equipe = (e: Equipe) => (
    <div className="flex flex-col items-center text-center gap-2 min-w-0">
      {e.estAjso ? <Logo size={56} decoratif /> : <span aria-hidden className="w-[56px] h-[50px]" />}
      <p className={`font-display text-lg uppercase leading-tight break-words ${e.estAjso ? 'text-nuit' : 'text-encre/80'}`}>{nomAffiche(e)}</p>
    </div>
  );
  return (
    <article className="border border-filet flex flex-col">
      <h3 className="bg-bande text-white font-display uppercase tracking-wide text-lg px-4 py-2 flex justify-between gap-3">
        {titre}<span className="text-[15px]">{r.domicile ? 'À domicile' : 'À l\'extérieur'}</span>
      </h3>
      <p className="px-4 pt-3 text-[13px] text-bande-fonce">
        <Link href={`/equipes/${r.equipe.id}`} className="hover:underline">{r.equipe.nom}</Link>{comp ? ` · ${comp}` : ''}
      </p>
      <div className="px-4 py-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
        {equipe(rec)}
        <span className="font-display text-xl text-encre/50">contre</span>
        {equipe(vis)}
      </div>
      <p className="mt-auto px-4 py-3 border-t border-filet text-[14px]">
        <span className="capitalize font-semibold">{formatDateMatch(r)}</span> · <span className="font-semibold text-bande-fonce">{formatHoraire(r)}</span>
        {r.lieu && <span className="block text-encre/75">{r.lieu}</span>}
      </p>
    </article>
  );
}

/** Ligne de calendrier / résultat (listes séparées par des filets). */
export function LigneMatch({ r }: { r: Rencontre }) {
  const res = issue(r);
  const rec = recevant(r), vis = visiteur(r);
  const d = parseDate(r.date);
  const jour = d.toLocaleDateString('fr-FR', { day: '2-digit', timeZone: FUSEAU });
  const mois = d.toLocaleDateString('fr-FR', { month: 'short', timeZone: FUSEAU }).replace('.', '');
  const jourSemaine = d.toLocaleDateString('fr-FR', { weekday: 'short', timeZone: FUSEAU }).replace('.', '');
  const dom = r.scoreDom ?? 0, ext = r.scoreExt ?? 0;
  const score = (n: number | null | undefined, gagne: boolean) => (
    <span className={`inline-flex items-center justify-center min-w-9 h-9 px-1 font-display text-xl tabular-nums ${gagne ? 'bg-nuit text-white' : 'bg-papier text-encre border border-filet'}`}>{n}</span>
  );

  return (
    <div className="py-3.5 px-2 md:px-3 grid grid-cols-[48px_minmax(0,1fr)] md:grid-cols-[64px_minmax(0,1fr)_minmax(0,200px)] items-center gap-x-4 gap-y-2 hover:bg-papier">
      {/* Date */}
      <div className="text-center leading-none self-start md:self-center font-display uppercase text-bande">
        <span className="block text-[12px]">{r.dateConfirmee === false ? 'W-E' : jourSemaine}</span>
        <span className="block text-[1.7rem] leading-[1.05]">{jour}</span>
        <span className="block text-[12px]">{mois}</span>
      </div>

      {/* Affiche */}
      <div className="min-w-0">
        <p className="text-[12.5px] text-encre/75 truncate">
          <Link href={`/equipes/${r.equipe.id}`} className="font-semibold text-bande-fonce hover:underline">{r.equipe.nom}</Link>
          {competition(r) ? ` · ${competition(r)}` : ''}{r.journee ? ` · ${r.journee}` : ''}
        </p>
        {/* Mobile : deux lignes */}
        <div className="md:hidden mt-1 space-y-1">
          {[[rec, r.scoreDom, dom >= ext] as const, [vis, r.scoreExt, ext >= dom] as const].map(([e, s, g]) => (
            <div key={e.id} className="flex items-center gap-3">
              <span className={`flex-1 min-w-0 font-display text-[17px] uppercase leading-tight ${e.estAjso ? 'text-nuit' : 'text-encre/80'}`}>{nomAffiche(e)}</span>
              {res && <span className={`font-display text-xl tabular-nums ${g ? 'text-nuit' : 'text-encre/55'}`}>{s}</span>}
            </div>
          ))}
        </div>
        {/* Grand écran : une ligne */}
        <div className="hidden md:flex items-center gap-3 mt-1 font-display text-lg lg:text-xl uppercase leading-tight">
          <span className={`flex-1 min-w-0 text-right ${rec.estAjso ? 'text-nuit' : 'text-encre/80'}`}>{nomAffiche(rec)}</span>
          {res ? (
            <span className="flex items-center gap-1 shrink-0" aria-label={`Score ${r.scoreDom} à ${r.scoreExt}`}>
              {score(r.scoreDom, dom >= ext)}{score(r.scoreExt, ext >= dom)}
            </span>
          ) : (
            <span className="shrink-0 w-[76px] text-center text-[15px] text-encre/60 normal-case">contre</span>
          )}
          <span className={`flex-1 min-w-0 ${vis.estAjso ? 'text-nuit' : 'text-encre/80'}`}>{nomAffiche(vis)}</span>
        </div>
      </div>

      {/* Infos */}
      <div className="col-start-2 md:col-start-auto flex flex-wrap md:flex-col md:items-end items-center gap-x-3 gap-y-1 text-[13px] text-encre/75">
        {res ? (
          <span className={`font-display uppercase text-[13px] px-2 py-0.5 ${PASTILLE[res.resultat]}`}>{libelleResultat[res.resultat]}</span>
        ) : (
          <span className="font-semibold text-bande-fonce">{r.dateConfirmee === false ? formatDateMatch(r) : formatHoraire(r)}</span>
        )}
        <span className="md:text-right">{r.domicile ? 'Domicile' : 'Extérieur'}{r.lieu ? <span className="hidden md:inline"> · {r.lieu}</span> : null}</span>
      </div>
    </div>
  );
}

/** Tableau compact (accueil) : date, équipe, adversaire, score ou horaire. */
export function TableauMatchs({ matchs, legende }: { matchs: Rencontre[]; legende: string }) {
  return (
    <table className="w-full text-[14px]">
      <caption className="sr-only">{legende}</caption>
      <thead className="sr-only">
        <tr><th scope="col">Date</th><th scope="col">Match</th><th scope="col">Score ou horaire</th></tr>
      </thead>
      <tbody>
        {matchs.map((r) => {
          const res = issue(r);
          const d = parseDate(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', timeZone: FUSEAU });
          return (
            <tr key={r.id} className="border-b border-filet align-top">
              <td className="py-2.5 pr-3 text-encre/75 tabular-nums whitespace-nowrap">{d}</td>
              <td className="py-2.5 pr-3 min-w-0">
                <Link href={`/equipes/${r.equipe.id}`} className="font-semibold text-nuit hover:underline">{r.equipe.nom}</Link>
                <span className="block text-encre/75">{r.domicile ? 'contre' : 'à'} {r.equipeAdverse.nom}</span>
              </td>
              <td className="py-2.5 text-right whitespace-nowrap">
                {res ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="font-display text-lg tabular-nums text-nuit">{res.pour}-{res.contre}</span>
                    <PastilleResultat r={r} />
                  </span>
                ) : (
                  <span className="font-semibold text-bande-fonce">{r.dateConfirmee === false ? 'À fixer' : r.heure ? formatHeure(r.heure) : '–'}</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
