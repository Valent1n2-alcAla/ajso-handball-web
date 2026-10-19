import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, Section, Vide } from '@/components/ui';
import { getActualites } from '@/lib/api';
import { extrait, formatDatePub } from '@/lib/format';
import { CarteActu, VisuelActu } from '@/components/Actualite';

export const metadata: Metadata = {
  title: 'Actualités',
  description: "Toute l'actualité de l'AJS Ouistreham Handball : comptes rendus de matchs, vie du club, événements et annonces.",
};

export default async function ActualitesPage() {
  const actus = await getActualites();
  const [une, ...autres] = actus;

  return (
    <>
      <PageHero surtitre="La vie du club" titre="Actualités" />
      <Section>
        {!une ? <Vide titre="Pas encore d'article">Les nouvelles du club seront publiées ici.</Vide> : (
          <>
            <Link href={`/actualites/${une.id}`} className="group grid grid-cols-1 md:grid-cols-[1.15fr_1fr] bg-nuit text-white shadow-2xl shadow-nuit/20 mb-12 md:mb-16 overflow-hidden">
              <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[420px]">
                <VisuelActu a={une} sizes="(min-width: 768px) 55vw, 100vw" logo={180} />
              </div>
              <div className="relative p-7 md:p-12 flex flex-col justify-center motif-losanges">
                <span aria-hidden className="absolute top-0 left-0 right-0 h-1 bg-jaune md:hidden" />
                <p className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-widest mb-5">
                  <span className="bg-jaune text-nuit px-2.5 py-1 font-semibold">À la une</span>
                  <span className="text-glacier">{formatDatePub(une.datePub)}</span>
                </p>
                <h2 className="font-display text-4xl md:text-5xl uppercase leading-[1.02] group-hover:text-jaune transition-colors">{une.titre}</h2>
                <p className="text-white/80 mt-5 text-lg">{extrait(une.extrait ?? une.contenu, 260)}</p>
                <span className="inline-flex items-center gap-2 mt-8 font-display uppercase tracking-wide text-jaune">
                  Lire l&apos;article <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </div>
            </Link>
            {autres.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {autres.map((a, i) => <CarteActu key={a.id} a={a} i={i + 1} />)}
              </div>
            )}
          </>
        )}
      </Section>
    </>
  );
}
