import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, Section, Vide } from '@/components/ui';
import { getActualites } from '@/lib/api';
import { extrait, formatDatePub } from '@/lib/format';
import ImageContenu from '@/components/ImageContenu';

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
        {!une ? <Vide>Aucun article pour le moment.</Vide> : (
          <>
            <Link href={`/actualites/${une.id}`} className="group grid md:grid-cols-2 gap-8 items-center mb-16">
              <div className="aspect-[16/10] bg-losange overflow-hidden relative">
                {une.image ? (
                  <ImageContenu src={une.image} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : <span className="absolute inset-0 flex items-center justify-center font-display text-8xl text-white/15">AJSO</span>}
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-violet mb-3">À la une · {formatDatePub(une.datePub)}</p>
                <h2 className="font-display text-4xl md:text-5xl uppercase leading-none group-hover:text-roi">{une.titre}</h2>
                <p className="text-nuit/60 mt-4 text-lg">{extrait(une.extrait ?? une.contenu, 260)}</p>
                <span className="inline-block mt-6 font-display uppercase text-roi">Lire l&apos;article →</span>
              </div>
            </Link>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {autres.map((a) => (
                <Link key={a.id} href={`/actualites/${a.id}`} className="group block border-t-4 border-nuit pt-5 hover:border-violet transition-colors">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-violet mb-2">{formatDatePub(a.datePub)}</p>
                  <h3 className="font-display text-2xl uppercase leading-tight group-hover:text-roi">{a.titre}</h3>
                  <p className="text-nuit/60 mt-2">{extrait(a.extrait ?? a.contenu, 140)}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </Section>
    </>
  );
}
