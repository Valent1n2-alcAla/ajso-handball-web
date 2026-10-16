import Link from 'next/link';
import { formatDateCourte, formatDateLongue, formatHeure, issue, recevant, visiteur } from '@/lib/format';
import type { Rencontre } from '@/lib/types';

const couleurResultat = { V: 'bg-emerald-500', N: 'bg-jaune', D: 'bg-rose-500' } as const;
const libelleResultat = { V: 'Victoire', N: 'Nul', D: 'Défaite' } as const;

function NomEquipe({ r, cote }: { r: Rencontre; cote: 'rec' | 'vis' }) {
  const e = cote === 'rec' ? recevant(r) : visiteur(r);
  const nom = e.estAjso ? `AJSO ${e.nom}` : e.nom;
  return <span className={e.estAjso ? 'text-current' : 'opacity-70'}>{nom}</span>;
}

/** Carte « prochain match » mise en avant. */
export function CarteMatch({ r }: { r: Rencontre }) {
  return (
    <div className="bg-white text-nuit shadow-2xl shadow-nuit/40">
      <div className="bg-losange text-white px-6 py-2.5 flex items-center justify-between">
        <span className="font-display text-sm tracking-wider uppercase">Prochain match</span>
        <span className="font-mono text-[11px] tracking-widest">{r.domicile ? 'À DOMICILE' : 'EXTÉRIEUR'}</span>
      </div>
      <div className="px-6 pt-6 pb-2 font-mono text-[11px] uppercase tracking-widest text-violet">
        {r.equipe.categorie?.nom}{r.equipe.championnat ? ` · ${r.equipe.championnat.nom}` : ''}
      </div>
      <div className="px-6 pb-6 flex items-center justify-between gap-4">
        <p className="font-display text-xl md:text-2xl uppercase leading-none flex-1"><NomEquipe r={r} cote="rec" /></p>
        <span className="font-display text-2xl text-nuit/20 px-2">VS</span>
        <p className="font-display text-xl md:text-2xl uppercase leading-none flex-1 text-right"><NomEquipe r={r} cote="vis" /></p>
      </div>
      <div className="px-6 py-4 border-t border-nuit/10 flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-sm">
        <span className="capitalize">{formatDateLongue(r.date)}</span>
        <span className="text-roi font-semibold">{formatHeure(r.heure)}</span>
        <span className="text-nuit/50 md:ml-auto">{r.lieu}</span>
      </div>
    </div>
  );
}

/** Ligne de calendrier / résultat. */
export function LigneMatch({ r, sombre = false }: { r: Rencontre; sombre?: boolean }) {
  const res = issue(r);
  const sec = sombre ? 'text-white/40' : 'text-nuit/40';
  return (
    <div className="py-6 grid grid-cols-[64px_1fr] md:grid-cols-[80px_1fr_auto] items-center gap-x-5 gap-y-2">
      <div className="font-display leading-none text-center">
        <span className="text-3xl block">{formatDateCourte(r.date).split(' ')[0]}</span>
        <span className={`font-mono text-[10px] uppercase ${sec}`}>{formatDateCourte(r.date).split(' ').slice(1).join(' ')}</span>
      </div>
      <div className="min-w-0">
        <Link href={`/equipes/${r.equipe.id}`} className={`font-mono text-[10px] uppercase tracking-widest ${sombre ? 'text-glacier' : 'text-violet'} hover:underline`}>
          {r.equipe.nom}{r.equipe.championnat ? ` · ${r.equipe.championnat.nom}` : ''}
        </Link>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-display text-lg md:text-xl uppercase leading-tight mt-1">
          <NomEquipe r={r} cote="rec" />
          {res ? (
            <span className={`font-mono font-semibold text-2xl whitespace-nowrap ${sombre ? 'text-jaune' : 'text-violet'}`}>
              {r.scoreDom}<span className={sec}> – </span>{r.scoreExt}
            </span>
          ) : (
            <span className={`text-base ${sec}`}>vs</span>
          )}
          <NomEquipe r={r} cote="vis" />
        </div>
      </div>
      <div className={`col-start-2 md:col-start-auto flex items-center gap-3 font-mono text-xs ${sec}`}>
        {res ? (
          <span className={`inline-flex items-center gap-2 ${sombre ? 'text-white/80' : 'text-nuit/80'}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${couleurResultat[res.resultat]}`} />
            {libelleResultat[res.resultat]}
          </span>
        ) : (
          <span>{formatHeure(r.heure)} · {r.domicile ? 'Domicile' : 'Extérieur'}</span>
        )}
        <span className="hidden md:inline">· {r.lieu}</span>
      </div>
    </div>
  );
}
