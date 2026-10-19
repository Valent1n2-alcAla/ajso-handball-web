import Link from 'next/link';
import ImageContenu from './ImageContenu';
import Logo from './Logo';
import { extrait, FUSEAU } from '@/lib/format';
import type { Actualite } from '@/lib/types';

const FONDS = ['bg-bande', 'bg-nuit', 'bg-bande-fonce'];

/** Visuel d'un article : sa photo, sinon un aplat aux couleurs du club avec le logo en filigrane. */
export function VisuelActu({ a, sizes, variante = 0, logo = 110, prioritaire = false }: { a: Pick<Actualite, 'image'>; sizes: string; variante?: number; logo?: number; prioritaire?: boolean }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${FONDS[variante % FONDS.length]}`}>
      {a.image ? (
        <ImageContenu src={a.image} alt="" fill sizes={sizes} preload={prioritaire} className="object-cover" />
      ) : (
        <span aria-hidden className="absolute inset-0 flex items-center justify-center opacity-25">
          <Logo size={logo} decoratif />
        </span>
      )}
    </div>
  );
}

/** Carte d'article de l'accueil : visuel puis titre. */
export function CarteActu({ a, i = 0 }: { a: Actualite; i?: number }) {
  return (
    <Link href={`/actualites/${a.id}`} className="group grid grid-cols-[130px_minmax(0,1fr)] gap-3 items-start sm:block">
      <div className="relative aspect-[4/3]">
        <VisuelActu a={a} variante={i} logo={70} sizes="(min-width: 1024px) 270px, (min-width: 640px) 33vw, 130px" />
      </div>
      <h3 className="font-display uppercase text-nuit text-[17px] leading-snug sm:mt-2 group-hover:text-bande-fonce group-hover:underline">{a.titre}</h3>
    </Link>
  );
}

/** Bloc date « 24 / JUIL / 2025 » souligné d'un filet épais. */
export function BlocDate({ date }: { date: string }) {
  const d = new Date(date);
  const f = (o: Intl.DateTimeFormatOptions) => d.toLocaleDateString('fr-FR', { ...o, timeZone: FUSEAU });
  return (
    <div className="w-[70px] md:w-[86px] shrink-0 text-center font-display uppercase text-bande leading-[0.95]">
      <time dateTime={d.toISOString()} className="block pb-2 border-b-[6px] md:border-b-8 border-nuit">
        <span className="block text-[2.3rem] md:text-[2.8rem]">{f({ day: '2-digit' })}</span>
        <span className="block text-[1.4rem] md:text-[1.75rem]">{f({ month: 'short' }).replace('.', '').slice(0, 4)}</span>
        <span className="block text-[1.2rem] md:text-[1.45rem]">{f({ year: 'numeric' })}</span>
      </time>
    </div>
  );
}

/** Ligne de la liste des actualités : date, vignette, titre, extrait. */
export function LigneActu({ a, i = 0 }: { a: Actualite; i?: number }) {
  return (
    <article className="flex gap-3 md:gap-5 py-5 border-b border-filet">
      <BlocDate date={a.datePub} />
      <Link href={`/actualites/${a.id}`} tabIndex={-1} aria-hidden className="relative hidden sm:block shrink-0 w-[170px] aspect-[16/10] self-start">
        <VisuelActu a={a} variante={i} logo={64} sizes="170px" />
      </Link>
      <div className="min-w-0 flex-1">
        <h2 className="font-display uppercase text-nuit text-lg md:text-xl leading-snug">
          <Link href={`/actualites/${a.id}`} className="hover:text-bande-fonce hover:underline">{a.titre}</Link>
        </h2>
        <p className="text-[14px] text-encre/85 mt-1.5 leading-relaxed">{extrait(a.extrait ?? a.contenu, 260)}</p>
      </div>
    </article>
  );
}
