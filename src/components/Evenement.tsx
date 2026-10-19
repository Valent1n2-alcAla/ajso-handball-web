import { formatPeriode, FUSEAU, parseDateHeure, TYPES_EVENEMENT } from '@/lib/format';
import type { Evenement } from '@/lib/types';
import ImageContenu from '@/components/ImageContenu';

export function CarteEvenement({ e, passe = false }: { e: Evenement; passe?: boolean }) {
  const d = parseDateHeure(e.debut);
  const f = (o: Intl.DateTimeFormatOptions) => d.toLocaleDateString('fr-FR', { ...o, timeZone: FUSEAU });
  return (
    <article className="flex gap-4 md:gap-5 py-5 border-b border-filet">
      <div className={`w-[64px] shrink-0 text-center font-display uppercase leading-[0.95] self-start pb-2 border-b-[6px] border-nuit ${passe ? 'text-encre/70' : 'text-bande'}`}>
        <span className="block text-[2.2rem]">{f({ day: '2-digit' })}</span>
        <span className="block text-xl">{f({ month: 'short' }).replace('.', '').slice(0, 4)}</span>
        <span className="block text-base">{f({ year: 'numeric' })}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-bande-fonce">{TYPES_EVENEMENT[e.type] ?? 'Événement'}</p>
        <h3 className="font-display text-xl uppercase leading-snug text-nuit">{e.titre}</h3>
        <p className="text-[14px] mt-0.5 capitalize">{formatPeriode(e.debut, e.fin)}{e.lieu ? <span className="normal-case"> · {e.lieu}</span> : null}</p>
        {e.description && !passe && <p className="mt-2 text-[14px] leading-relaxed">{e.description}</p>}
        {e.image && !passe && (
          <ImageContenu src={e.image} alt="" width={1200} height={512} sizes="(min-width: 1024px) 50vw, 100vw" className="mt-3 w-full max-h-64 object-cover" />
        )}
        {e.lienInscription && !passe && (
          <a href={e.lienInscription} target="_blank" rel="noopener noreferrer"
            className="inline-block mt-3 bg-bande text-white font-display uppercase px-4 py-1.5 hover:bg-bande-fonce">
            S&apos;inscrire<span className="sr-only"> (nouvel onglet)</span>
          </a>
        )}
      </div>
    </article>
  );
}
