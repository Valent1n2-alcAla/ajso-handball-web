import Link from 'next/link';
import ImageContenu from './ImageContenu';
import Logo from './Logo';
import { extrait, formatDatePub } from '@/lib/format';
import type { Actualite } from '@/lib/types';

/** Visuel d'un article : sa photo, sinon un fond aux couleurs du club avec le logo. */
export function VisuelActu({ a, sizes, variante = 0, logo = 96 }: { a: Actualite; sizes: string; variante?: number; logo?: number }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${variante % 2 === 0 ? 'bg-losange' : 'bg-nuit motif-losanges'}`}>
      {a.image ? (
        <ImageContenu src={a.image} alt="" fill sizes={sizes} className="object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <span aria-hidden className="absolute inset-0 flex items-center justify-center">
          <span className="absolute w-[55%] max-w-64 aspect-square rotate-45 border-2 border-white/15 group-hover:rotate-[60deg] transition-transform duration-700" />
          <span className="relative opacity-90 group-hover:scale-105 transition-transform duration-500"><Logo size={logo} decoratif /></span>
        </span>
      )}
    </div>
  );
}

/** Carte d'article (accueil, liste des actualités). */
export function CarteActu({ a, i = 0 }: { a: Actualite; i?: number }) {
  return (
    <Link href={`/actualites/${a.id}`} className="group flex flex-col bg-white shadow-sm ring-1 ring-nuit/5 hover:shadow-xl hover:shadow-nuit/10 hover:-translate-y-1 transition duration-300">
      <div className="relative aspect-[16/10]">
        <VisuelActu a={a} variante={i} sizes="(min-width: 768px) 33vw, 100vw" />
        <span className="absolute left-0 bottom-0 bg-jaune text-nuit font-mono text-[10px] uppercase tracking-widest px-3 py-1.5">{formatDatePub(a.datePub)}</span>
      </div>
      <div className="p-5 md:p-6 flex flex-col flex-1">
        <h3 className="font-display text-2xl uppercase leading-[1.12] group-hover:text-roi transition-colors">{a.titre}</h3>
        <p className="text-nuit/70 mt-2">{extrait(a.extrait ?? a.contenu, 140)}</p>
        <span className="mt-auto pt-4 font-display uppercase tracking-wide text-roi">Lire l&apos;article <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1">→</span></span>
      </div>
    </Link>
  );
}
