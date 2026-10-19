import type { Metadata } from 'next';
import Link from 'next/link';
import { Section, TitrePage, Vide } from '@/components/ui';
import Logo from '@/components/Logo';
import { getAlbums } from '@/lib/api';
import { formatDateLongue } from '@/lib/format';
import ImageContenu from '@/components/ImageContenu';

export const metadata: Metadata = {
  title: 'Galerie photos',
  description: "Albums photos de l'AJS Ouistreham Handball : matchs, tournois et moments forts de la vie du club.",
};

export default async function GaleriePage() {
  const albums = await getAlbums();
  return (
    <>
      <TitrePage titre="Galerie photos">Matchs, tournois et moments du club.</TitrePage>
      <Section>
        {albums.length === 0 ? <Vide>Les premiers albums arrivent bientôt.</Vide> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {albums.map((a) => (
              <Link key={a.id} href={`/galerie/${a.id}`} className="group block">
                <div className="aspect-[4/3] bg-bande overflow-hidden relative">
                  {a.couverture ? (
                    <ImageContenu src={a.couverture} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                  ) : <span aria-hidden className="absolute inset-0 flex items-center justify-center opacity-25"><Logo size={130} decoratif /></span>}
                  <span className="absolute bottom-0 right-0 bg-nuit text-white text-[13px] px-2.5 py-1">{a.nombrePhotos} photo{a.nombrePhotos > 1 ? 's' : ''}</span>
                </div>
                <p className="text-[13px] font-semibold text-bande-fonce mt-2 first-letter:uppercase">{formatDateLongue(a.date)}</p>
                <h2 className="font-display text-xl uppercase leading-tight text-nuit group-hover:underline">{a.titre}</h2>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
