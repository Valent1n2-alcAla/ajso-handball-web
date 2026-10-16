import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, Section, Vide } from '@/components/ui';
import { getAlbums } from '@/lib/api';
import { formatDateLongue } from '@/lib/format';

export const metadata: Metadata = { title: 'Galerie photos' };

export default async function GaleriePage() {
  const albums = await getAlbums();
  return (
    <>
      <PageHero surtitre="En images" titre="Galerie">Matchs, tournois et moments du club.</PageHero>
      <Section>
        {albums.length === 0 ? <Vide>Les premiers albums arrivent bientôt.</Vide> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((a) => (
              <Link key={a.id} href={`/galerie/${a.id}`} className="group block">
                <div className="aspect-[4/3] bg-losange overflow-hidden relative">
                  {a.couverture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.couverture} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : <span className="absolute inset-0 flex items-center justify-center font-display text-6xl text-white/15">AJSO</span>}
                  <span className="absolute bottom-3 right-3 bg-nuit/80 text-white font-mono text-xs px-2.5 py-1">{a.nombrePhotos} photo{a.nombrePhotos > 1 ? 's' : ''}</span>
                </div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-violet mt-4 capitalize">{formatDateLongue(a.date)}</p>
                <h2 className="font-display text-2xl uppercase leading-tight group-hover:text-roi">{a.titre}</h2>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
