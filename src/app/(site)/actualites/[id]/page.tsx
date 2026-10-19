import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CONTENEUR, TitrePage } from '@/components/ui';
import { getActualite, getActualites } from '@/lib/api';
import { extrait, formatDatePub, FUSEAU } from '@/lib/format';
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
  const { id } = await params;
  const [a, toutes] = await Promise.all([getActualite(id), getActualites()]);
  if (!a) notFound();
  const autres = toutes.filter((x) => x.id !== a.id).slice(0, 6);
  const date = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', timeZone: FUSEAU });

  return (
    <>
      <TitrePage titre={a.titre} retour={{ href: '/actualites', label: 'Actualités' }} />
      <div className={`${CONTENEUR} pt-4 grid gap-10 lg:grid-cols-[minmax(0,1fr)_270px]`}>
        <article>
          <p className="text-[13px] text-bande-fonce font-semibold">Publié le <time dateTime={a.datePub}>{formatDatePub(a.datePub)}</time></p>
          {a.image && (
            <ImageContenu src={a.image} alt="" width={1600} height={900} preload sizes="(min-width: 1170px) 840px, 100vw" className="w-full h-auto mt-4" />
          )}
          <div className="texte-article mt-5 text-[15px] leading-relaxed text-encre max-w-3xl">
            {a.contenu.split(/\n{2,}/).map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}
          </div>
        </article>
        {autres.length > 0 && (
          <aside aria-labelledby="titre-fil">
            <h2 id="titre-fil" className="font-display text-[1.75rem] uppercase leading-tight text-bande mb-4">Fil infos</h2>
            <ul className="border-t border-filet">
              {autres.map((x) => (
                <li key={x.id} className="border-b border-filet">
                  <Link href={`/actualites/${x.id}`} className="flex gap-3 py-3 text-[14px] hover:text-bande-fonce group">
                    <time dateTime={x.datePub} className="shrink-0 tabular-nums">{date(x.datePub)}</time>
                    <span className="truncate group-hover:underline">{x.titre}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </>
  );
}
