import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Section } from '@/components/ui';
import { getActualite } from '@/lib/api';
import { extrait, formatDatePub } from '@/lib/format';
import ImageContenu from '@/components/ImageContenu';

export async function generateMetadata({ params }: PageProps<'/actualites/[id]'>): Promise<Metadata> {
  const a = await getActualite((await params).id);
  if (!a) return {};
  const description = extrait(a.extrait ?? a.contenu, 160);
  return {
    title: a.titre,
    description,
    // Remplace l'openGraph du layout racine : siteName, locale et image repris ici
    openGraph: { type: 'article', siteName: 'AJSO Handball', locale: 'fr_FR', title: a.titre, description, publishedTime: a.datePub, images: [a.image ?? '/logo-ajso.png'] },
  };
}

export default async function ActualitePage({ params }: PageProps<'/actualites/[id]'>) {
  const a = await getActualite((await params).id);
  if (!a) notFound();

  return (
    <article>
      <header className="bg-nuit text-white motif-losanges">
        <div className="max-w-4xl mx-auto px-4 md:px-10 pt-14 pb-16">
          <Link href="/actualites" className="font-mono text-xs uppercase tracking-widest text-glacier hover:text-jaune">← Actualités</Link>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-jaune mt-8 mb-4">{formatDatePub(a.datePub)}</p>
          <h1 className="font-display text-4xl md:text-7xl uppercase leading-[1.02]">{a.titre}</h1>
        </div>
      </header>
      {a.image && (
        <div className="max-w-5xl mx-auto px-4 md:px-10 -mb-8 relative">
          <ImageContenu src={a.image} alt="" width={1600} height={900} preload sizes="(min-width: 1024px) 1024px, 100vw" className="w-full aspect-[16/9] object-cover -mt-0 md:mt-10 shadow-xl" />
        </div>
      )}
      <Section className="max-w-3xl!">
        <div className="text-lg leading-relaxed text-nuit/85 space-y-5">
          {a.contenu.split(/\n{2,}/).map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}
        </div>
      </Section>
    </article>
  );
}
