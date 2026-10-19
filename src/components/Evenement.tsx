import { formatPeriode, FUSEAU, parseDateHeure, TYPES_EVENEMENT } from '@/lib/format';
import type { Evenement } from '@/lib/types';
import { Badge } from './ui';
import ImageContenu from '@/components/ImageContenu';

export function CarteEvenement({ e, passe = false, sombre = false }: { e: Evenement; passe?: boolean; sombre?: boolean }) {
  const d = parseDateHeure(e.debut);
  return (
    <article className={`flex gap-4 md:gap-6 transition duration-300 ${passe ? 'opacity-80' : 'hover:-translate-y-0.5'} ${sombre ? 'border border-white/10 p-5 md:p-6' : `bg-white ring-1 ring-nuit/10 p-5 md:p-6 ${passe ? '' : 'shadow-sm hover:shadow-xl hover:shadow-nuit/10'}`}`}>
      <div className={`shrink-0 w-[4.5rem] md:w-20 text-center ${passe ? 'bg-nuit/10 text-nuit' : 'bg-losange text-white shadow-lg shadow-violet/30'} py-3 self-start`}>
        <span className="font-display text-4xl leading-none block">{d.toLocaleDateString('fr-FR', { day: 'numeric', timeZone: FUSEAU })}</span>
        <span className="font-mono text-[11px] uppercase">{d.toLocaleDateString('fr-FR', { month: 'short', timeZone: FUSEAU })}</span>
        <span className="font-mono text-[10px] block opacity-70">{d.toLocaleDateString('fr-FR', { year: 'numeric', timeZone: FUSEAU })}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap gap-2 mb-2"><Badge ton={passe ? 'gris' : 'violet'}>{TYPES_EVENEMENT[e.type] ?? 'Événement'}</Badge></div>
        <h3 className="font-display text-2xl md:text-[1.75rem] uppercase leading-[1.12]">{e.titre}</h3>
        <p className={`font-mono text-xs mt-1 capitalize ${sombre ? 'text-glacier' : 'text-violet'}`}>{formatPeriode(e.debut, e.fin)}</p>
        {e.lieu && <p className={`text-sm mt-1 ${sombre ? 'text-white/70' : 'text-nuit/65'}`}>{e.lieu}</p>}
        {e.description && !passe && <p className={`mt-3 ${sombre ? 'text-white/75' : 'text-nuit/75'}`}>{e.description}</p>}
        {e.image && !passe && (
          <ImageContenu src={e.image} alt="" width={1200} height={512} sizes="(min-width: 1024px) 50vw, 100vw" className="mt-4 w-full max-h-64 object-cover" />
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
