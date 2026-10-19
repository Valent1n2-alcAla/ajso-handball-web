import Link from 'next/link';
import Logo from './Logo';
import { formatDateCourte, formatDateMatch, formatHoraire, issue, recevant, visiteur, nomCompetition, parseDate, FUSEAU } from '@/lib/format';
import { styleCategorie } from '@/lib/categories';
import type { Equipe, Rencontre } from '@/lib/types';

type Res = 'V' | 'N' | 'D';
const libelleResultat: Record<Res, string> = { V: 'Victoire', N: 'Nul', D: 'Défaite' };
/** Pastille de résultat (texte blanc / nuit : contraste AA). */
const pastille: Record<Res, string> = { V: 'bg-victoire text-white', N: 'bg-jaune text-nuit', D: 'bg-defaite text-white' };
const filet: Record<Res, string> = { V: 'before:bg-victoire', N: 'before:bg-jaune', D: 'before:bg-defaite' };

const nomAffiche = (e: Equipe) => (e.estAjso ? `AJSO ${e.nom}` : e.nom);
const competition = (r: Rencontre) => {
  const c = r.championnat ?? r.equipe.championnat;
  return c ? nomCompetition(c) : null;
};

/** Écusson : logo du club pour l'AJSO, initiales dans un losange pour l'adversaire. */
function Ecusson({ e, taille = 'md' }: { e: Equipe; taille?: 'sm' | 'md' | 'lg' }) {
  const t = { sm: 'w-9 h-9 text-[11px]', md: 'w-14 h-14 text-sm', lg: 'w-20 h-20 md:w-24 md:h-24 text-lg' }[taille];
  if (e.estAjso) {
    const px = { sm: 36, md: 56, lg: 96 }[taille];
    return <span className={`${t} shrink-0 flex items-center justify-center`}><Logo size={px} decoratif /></span>;
  }
  const initiales = e.nom.replace(/[^\p{L}\s-]/gu, '').split(/[\s-]+/).filter((m) => m.length > 1 || /\p{Lu}/u.test(m)).map((m) => m[0]).slice(0, 3).join('').toUpperCase();
  return (
    <span aria-hidden className={`${t} shrink-0 relative flex items-center justify-center`}>
      <span className="absolute inset-[14%] rotate-45 bg-nuit/[0.06] border border-nuit/15" />
      <span className="relative font-display tracking-wide text-nuit/70">{initiales || '?'}</span>
    </span>
  );
}

/** Carte « prochain match » mise en avant. */
export function CarteMatch({ r, titre = 'Prochain match' }: { r: Rencontre; titre?: string }) {
  const rec = recevant(r), vis = visiteur(r);
  const comp = competition(r);
  return (
    <article className="bg-white text-nuit shadow-2xl shadow-nuit/30 h-full flex flex-col" style={styleCategorie(r.equipe)}>
      <div className="bg-losange text-white px-5 md:px-6 py-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-display text-sm tracking-wider uppercase">
          <span aria-hidden className="w-2 h-2 rounded-full bg-jaune animate-pulsation" />
          {titre}
        </span>
        <span className="font-mono text-[11px] tracking-widest uppercase">{r.domicile ? 'À domicile' : 'À l\'extérieur'}</span>
      </div>
      <div className="px-5 md:px-6 pt-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-violet">
        <span aria-hidden className="w-2.5 h-2.5 rotate-45 bg-(--cat)" />
        <Link href={`/equipes/${r.equipe.id}`} className="hover:underline truncate min-w-0">{r.equipe.nom}{comp ? ` · ${comp}` : ''}</Link>
      </div>
      <div className="px-5 md:px-6 py-6 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
        <div className="flex flex-col items-center text-center gap-2 min-w-0">
          <Ecusson e={rec} />
          <p className={`font-display text-lg md:text-xl uppercase leading-tight break-words ${rec.estAjso ? '' : 'text-nuit/75'}`}>{nomAffiche(rec)}</p>
        </div>
        <span className="font-display text-3xl text-nuit/15 px-1">VS</span>
        <div className="flex flex-col items-center text-center gap-2 min-w-0">
          <Ecusson e={vis} />
          <p className={`font-display text-lg md:text-xl uppercase leading-tight break-words ${vis.estAjso ? '' : 'text-nuit/75'}`}>{nomAffiche(vis)}</p>
        </div>
      </div>
      <div className="mt-auto px-5 md:px-6 py-4 bg-papier flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-sm">
        <span className="capitalize font-semibold">{formatDateMatch(r)}</span>
        <span className="text-roi font-semibold">{formatHoraire(r)}</span>
        {r.lieu && <span className="text-nuit/60 basis-full truncate">{r.lieu}</span>}
      </div>
    </article>
  );
}

/** Carte de résultat : score en grand, couleur selon l'issue. */
export function CarteResultat({ r, sombre = false }: { r: Rencontre; sombre?: boolean }) {
  const res = issue(r);
  if (!res) return null;
  const rec = recevant(r), vis = visiteur(r);
  const ligne = (e: Equipe, score: number | null | undefined, gagnant: boolean) => (
    <div className="flex items-center gap-3">
      <Ecusson e={e} taille="sm" />
      <p className={`flex-1 min-w-0 font-display uppercase text-lg leading-tight truncate ${gagnant ? '' : 'opacity-60'}`}>{nomAffiche(e)}</p>
      <span className={`font-display text-4xl leading-none tabular-nums ${gagnant ? '' : 'opacity-50'}`}>{score}</span>
    </div>
  );
  const dom = r.scoreDom ?? 0, ext = r.scoreExt ?? 0;
  return (
    <article
      className={`relative h-full flex flex-col p-5 pl-6 transition duration-200 hover:-translate-y-1 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 ${filet[res.resultat]} ${sombre ? 'bg-white/[0.06] text-white hover:bg-white/10' : 'bg-white text-nuit shadow-lg shadow-nuit/5 hover:shadow-xl hover:shadow-nuit/10 ring-1 ring-nuit/5'}`}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <Link href={`/equipes/${r.equipe.id}`} className={`min-w-0 font-mono text-[11px] uppercase tracking-widest truncate hover:underline ${sombre ? 'text-glacier' : 'text-violet'}`}>{r.equipe.nom}</Link>
        <span className={`shrink-0 font-mono text-[10px] font-semibold uppercase tracking-widest px-2 py-1 ${pastille[res.resultat]}`}>{libelleResultat[res.resultat]}</span>
      </div>
      <div className="space-y-2.5">
        {ligne(rec, r.scoreDom, dom >= ext)}
        {ligne(vis, r.scoreExt, ext >= dom)}
      </div>
      <p className={`mt-auto pt-4 font-mono text-[11px] uppercase tracking-wider ${sombre ? 'text-white/60' : 'text-nuit/55'}`}>
        <span className="capitalize">{formatDateCourte(r.date)}</span>{competition(r) ? ` · ${competition(r)}` : ''}
      </p>
    </article>
  );
}

/** Ligne de calendrier / résultat. */
export function LigneMatch({ r, sombre = false }: { r: Rencontre; sombre?: boolean }) {
  const res = issue(r);
  const rec = recevant(r), vis = visiteur(r);
  const sec = sombre ? 'text-white/60' : 'text-nuit/55';
  const d = parseDate(r.date);
  const jour = d.toLocaleDateString('fr-FR', { day: '2-digit', timeZone: FUSEAU });
  const mois = d.toLocaleDateString('fr-FR', { month: 'short', timeZone: FUSEAU });
  const jourSemaine = d.toLocaleDateString('fr-FR', { weekday: 'short', timeZone: FUSEAU });
  const dom = r.scoreDom ?? 0, ext = r.scoreExt ?? 0;
  const score = (n: number | null | undefined, gagne: boolean) => (
    <span className={`inline-flex items-center justify-center min-w-11 h-11 px-1.5 font-display text-2xl tabular-nums ${gagne ? (sombre ? 'bg-white text-nuit' : 'bg-nuit text-white') : sombre ? 'bg-white/10 text-white/80' : 'bg-nuit/[0.06] text-nuit/70'}`}>{n}</span>
  );

  return (
    <div
      className={`group relative py-5 pl-4 pr-3 md:pl-6 md:pr-5 grid grid-cols-[52px_minmax(0,1fr)] md:grid-cols-[72px_minmax(0,1fr)_minmax(0,240px)] items-center gap-x-4 md:gap-x-6 gap-y-3 transition-colors ${sombre ? 'hover:bg-white/[0.04]' : 'hover:bg-papier'} ${res ? `before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 ${filet[res.resultat]}` : ''}`}
      style={styleCategorie(r.equipe)}
    >
      {/* Date */}
      <div className="text-center leading-none self-start md:self-center">
        <span className={`font-mono text-[10px] uppercase block mb-1 ${sec}`}>{r.dateConfirmee === false ? 'WE' : jourSemaine.replace('.', '')}</span>
        <span className="font-display text-3xl md:text-4xl block">{jour}</span>
        <span className={`font-mono text-[10px] uppercase ${sec}`}>{mois.replace('.', '')}</span>
      </div>

      {/* Affiche */}
      <div className="min-w-0">
        <Link href={`/equipes/${r.equipe.id}`} className={`inline-flex items-center gap-2 font-mono text-[10px] md:text-[11px] uppercase tracking-widest max-w-full ${sombre ? 'text-glacier' : 'text-violet'} hover:underline`}>
          <span aria-hidden className="w-2 h-2 rotate-45 bg-(--cat) shrink-0" />
          <span className="truncate">{r.equipe.nom}{competition(r) ? ` · ${competition(r)}` : ''}{r.journee ? ` · ${r.journee}` : ''}</span>
        </Link>
        {/* Mobile : tableau de score sur deux lignes */}
        <div className="md:hidden mt-2 space-y-1.5">
          {[[rec, r.scoreDom, dom >= ext] as const, [vis, r.scoreExt, ext >= dom] as const].map(([e, s, g]) => (
            <div key={e.id} className="flex items-center gap-3">
              <span className={`flex-1 min-w-0 font-display text-lg uppercase leading-tight ${e.estAjso ? '' : 'opacity-75'}`}>{nomAffiche(e)}</span>
              {res && <span className={`font-display text-2xl tabular-nums ${g ? '' : 'opacity-45'}`}>{s}</span>}
            </div>
          ))}
        </div>
        {/* Desktop : affiche sur une ligne */}
        <div className="hidden md:flex items-center gap-4 mt-1.5 font-display text-xl lg:text-2xl uppercase leading-tight">
          <span className={`flex-1 min-w-0 text-right ${rec.estAjso ? '' : 'opacity-75'}`}>{nomAffiche(rec)}</span>
          {res ? (
            <span className="flex items-center gap-1.5 shrink-0" aria-label={`Score ${r.scoreDom} à ${r.scoreExt}`}>
              {score(r.scoreDom, dom >= ext)}{score(r.scoreExt, ext >= dom)}
            </span>
          ) : (
            <span className={`shrink-0 w-[94px] text-center text-base ${sec}`}>vs</span>
          )}
          <span className={`flex-1 min-w-0 ${vis.estAjso ? '' : 'opacity-75'}`}>{nomAffiche(vis)}</span>
        </div>
      </div>

      {/* Infos */}
      <div className={`col-start-2 md:col-start-auto flex flex-wrap md:flex-col md:items-end items-center gap-x-3 gap-y-1 font-mono text-xs ${sec}`}>
        {res ? (
          <span className={`font-semibold uppercase tracking-widest text-[10px] px-2 py-1 ${pastille[res.resultat]}`}>{libelleResultat[res.resultat]}</span>
        ) : (
          <span className={`font-semibold ${sombre ? 'text-jaune' : 'text-roi'}`}>{r.dateConfirmee === false ? formatDateMatch(r) : formatHoraire(r)}</span>
        )}
        <span>{r.domicile ? 'Domicile' : 'Extérieur'}{r.lieu ? <span className="hidden md:inline"> · {r.lieu}</span> : null}</span>
      </div>
    </div>
  );
}

/** Bandeau défilant des derniers résultats (statique si l'utilisateur limite les animations). */
export function BandeauResultats({ resultats }: { resultats: Rencontre[] }) {
  const items = resultats.filter((r) => issue(r)).slice(0, 10);
  if (items.length === 0) return null;
  // Assez d'éléments pour remplir la largeur avant la boucle
  const serie = Array.from({ length: Math.ceil(8 / items.length) }, () => items).flat();
  const texte = (r: Rencontre) => `${recevant(r).estAjso ? 'AJSO' : recevant(r).nom} ${r.scoreDom}–${r.scoreExt} ${visiteur(r).estAjso ? 'AJSO' : visiteur(r).nom}`;
  const liste = (n: number) => (
    <ul key={n} className="flex shrink-0 items-center">
      {serie.map((r, i) => {
        const res = issue(r)!;
        return (
          <li key={`${r.id}-${i}`} className="flex items-center gap-3 px-6 whitespace-nowrap border-r border-white/10">
            <span className={`w-6 h-6 inline-flex items-center justify-center font-mono text-[11px] font-semibold ${pastille[res.resultat]}`}>{res.resultat}</span>
            <span className="font-mono text-[11px] uppercase tracking-widest text-glacier">{r.equipe.nom}</span>
            <span className="font-display uppercase tracking-wide">
              {recevant(r).estAjso ? 'AJSO' : recevant(r).nom} <span className="text-jaune tabular-nums">{r.scoreDom}–{r.scoreExt}</span> {visiteur(r).estAjso ? 'AJSO' : visiteur(r).nom}
            </span>
          </li>
        );
      })}
    </ul>
  );
  return (
    <section aria-label="Derniers résultats" className="bg-nuit-2 text-white border-y border-white/10 flex items-stretch">
      <ul className="sr-only">
        {items.map((r) => <li key={r.id}>{r.equipe.nom} : {texte(r)}, {libelleResultat[issue(r)!.resultat].toLowerCase()}</li>)}
      </ul>
      <p aria-hidden className="relative z-10 shrink-0 bg-jaune text-nuit font-display uppercase tracking-wider px-4 md:px-6 flex items-center text-sm md:text-base">Résultats</p>
      <div aria-hidden className="defilant flex-1 overflow-hidden motion-reduce:overflow-x-auto py-3.5 [mask-image:linear-gradient(90deg,transparent,black_4%,black_96%,transparent)]">
        <div className="flex w-max animate-defilement motion-reduce:animate-none">
          {liste(0)}
          {liste(1)}
        </div>
      </div>
    </section>
  );
}
