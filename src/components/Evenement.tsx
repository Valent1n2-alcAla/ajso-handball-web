import { formatPeriode, parseDateHeure, TYPES_EVENEMENT } from '@/lib/format';
import type { Evenement } from '@/lib/types';
import { Badge } from './ui';

export function CarteEvenement({ e, passe = false, sombre = false }: { e: Evenement; passe?: boolean; sombre?: boolean }) {
  const d = parseDateHeure(e.debut);
  return (
    <article className={`flex gap-5 ${passe ? 'opacity-70' : ''} ${sombre ? 'border border-white/10 p-6' : 'bg-white border border-nuit/10 p-6'}`}>
      <div className={`shrink-0 w-20 text-center ${passe ? 'bg-nuit/10' : 'bg-losange text-white'} py-3 self-start`}>
        <span className="font-display text-4xl leading-none block">{d.getDate()}</span>
        <span className="font-mono text-[11px] uppercase">{d.toLocaleDateString('fr-FR', { month: 'short' })}</span>
        <span className="font-mono text-[10px] block opacity-70">{d.getFullYear()}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap gap-2 mb-2"><Badge ton={passe ? 'gris' : 'violet'}>{TYPES_EVENEMENT[e.type] ?? 'Événement'}</Badge></div>
        <h3 className="font-display text-2xl uppercase leading-tight">{e.titre}</h3>
        <p className={`font-mono text-xs mt-1 capitalize ${sombre ? 'text-glacier' : 'text-violet'}`}>{formatPeriode(e.debut, e.fin)}</p>
        {e.lieu && <p className={`text-sm mt-1 ${sombre ? 'text-white/60' : 'text-nuit/60'}`}>{e.lieu}</p>}
        {e.description && !passe && <p className={`mt-3 ${sombre ? 'text-white/75' : 'text-nuit/75'}`}>{e.description}</p>}
        {e.image && !passe && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={e.image} alt="" className="mt-4 w-full max-h-64 object-cover" />
        )}
        {e.lienInscription && !passe && (
          <a href={e.lienInscription} target="_blank" rel="noopener noreferrer"
            className="inline-block mt-4 bg-jaune text-nuit font-display uppercase tracking-wide px-5 py-2.5 hover:bg-nuit hover:text-white">
            S&apos;inscrire →
          </a>
        )}
      </div>
    </article>
  );
}
