import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Visionneuse from '@/components/Visionneuse';
import { Section, TitrePage, Vide } from '@/components/ui';
import { getAlbum } from '@/lib/api';
import { extrait, formatDateLongue } from '@/lib/format';

export async function generateMetadata({ params }: PageProps<'/galerie/[id]'>): Promise<Metadata> {
  const a = await getAlbum((await params).id);
  return a
    ? {
        title: a.titre,
        description: a.description ? extrait(a.description, 160) : `Album photos « ${a.titre} » (${a.nombrePhotos} photo${a.nombrePhotos > 1 ? 's' : ''}) de l'AJS Ouistreham Handball.`,
        openGraph: a.couverture ? { images: [a.couverture] } : undefined,
      }
    : {};
}

export default async function AlbumPage({ params }: PageProps<'/galerie/[id]'>) {
  const album = await getAlbum((await params).id);
  if (!album) notFound();

  return (
    <>
      <TitrePage titre={album.titre} retour={{ href: '/galerie', label: 'Galerie' }}>
        <p className="text-[13px] font-semibold text-bande-fonce first-letter:uppercase">{formatDateLongue(album.date)}</p>
        {album.description && <p className="mt-2">{album.description}</p>}
      </TitrePage>
      <Section>
        {(album.photos ?? []).length === 0 ? <Vide>Photos à venir.</Vide> : <Visionneuse photos={album.photos ?? []} />}
      </Section>
    </>
  );
}
