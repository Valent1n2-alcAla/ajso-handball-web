import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Visionneuse from '@/components/Visionneuse';
import { Section, Vide } from '@/components/ui';
import { getAlbum } from '@/lib/api';
import { formatDateLongue } from '@/lib/format';

export async function generateMetadata({ params }: PageProps<'/galerie/[id]'>): Promise<Metadata> {
  const a = await getAlbum((await params).id);
  return a ? { title: a.titre, openGraph: a.couverture ? { images: [a.couverture] } : undefined } : {};
}

export default async function AlbumPage({ params }: PageProps<'/galerie/[id]'>) {
  const album = await getAlbum((await params).id);
  if (!album) notFound();

  return (
    <>
      <header className="bg-nuit text-white motif-losanges">
        <div className="max-w-[1400px] mx-auto px-4 md:px-10 pt-14 pb-14">
          <Link href="/galerie" className="font-mono text-xs uppercase tracking-widest text-glacier hover:text-jaune">← Galerie</Link>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-jaune mt-8 mb-3 capitalize">{formatDateLongue(album.date)}</p>
          <h1 className="font-display text-4xl md:text-7xl uppercase leading-[0.95]">{album.titre}</h1>
          {album.description && <p className="text-white/70 mt-5 max-w-2xl text-lg">{album.description}</p>}
        </div>
      </header>
      <Section>
        {(album.photos ?? []).length === 0 ? <Vide>Photos à venir.</Vide> : <Visionneuse photos={album.photos ?? []} />}
      </Section>
    </>
  );
}
