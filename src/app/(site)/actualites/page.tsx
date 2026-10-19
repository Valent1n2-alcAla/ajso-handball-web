import type { Metadata } from 'next';
import Link from 'next/link';
import { Chevron, CONTENEUR, TitrePage, Vide } from '@/components/ui';
import { LigneActu } from '@/components/Actualite';
import { getActualites } from '@/lib/api';
import { rechercherActualites } from '@/lib/recherche';

export const metadata: Metadata = {
  title: 'Actualités',
  description: "Toute l'actualité de l'AJS Ouistreham Handball : comptes rendus de matchs, vie du club, événements et annonces.",
};

const PAR_PAGE = 10;

export default async function ActualitesPage({ searchParams }: PageProps<'/actualites'>) {
  const sp = await searchParams;
  const q = typeof sp.q === 'string' ? sp.q.trim().slice(0, 100) : '';
  const toutes = await getActualites();
  const actus = q ? rechercherActualites(toutes, q) : toutes;
  const pages = Math.max(1, Math.ceil(actus.length / PAR_PAGE));
  const demandee = typeof sp.page === 'string' && /^\d+$/.test(sp.page) ? Number(sp.page) : 1;
  const page = Math.min(Math.max(demandee, 1), pages);
  const liste = actus.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);
  const lien = (p: number) => `/actualites?${new URLSearchParams({ ...(q ? { q } : {}), ...(p > 1 ? { page: String(p) } : {}) })}`;

  return (
    <>
      <TitrePage titre="Actualités" />
      <div className={`${CONTENEUR} pt-5`}>
        <form action="/actualites" role="search" className="bg-bande px-3 py-3 flex flex-wrap items-center gap-3">
          <label htmlFor="recherche-actus" className="font-display uppercase text-white text-[15px]">Rechercher</label>
          <span className="flex flex-1 min-w-[220px] max-w-md">
            <input id="recherche-actus" name="q" type="search" defaultValue={q} maxLength={100} placeholder="Mot-clé, équipe…"
              className="flex-1 min-w-0 bg-white text-nuit px-3 py-1.5 text-[14px] outline-none border-2 border-white focus:border-nuit" />
            <button type="submit" className="bg-nuit text-white font-display uppercase px-4 hover:bg-bande-fonce">OK</button>
          </span>
          {q && (
            <Link href="/actualites" className="ml-auto inline-flex items-center gap-2 font-display uppercase text-white text-[15px] hover:underline">
              Toutes les actualités<Chevron className="w-2 h-2.5" />
            </Link>
          )}
        </form>

        {q && (
          <p className="mt-5 text-[14px]" role="status">
            {actus.length} résultat{actus.length > 1 ? 's' : ''} pour « <strong>{q}</strong> »
          </p>
        )}

        {liste.length === 0 ? (
          <div className="mt-6">
            <Vide titre={q ? 'Aucun article trouvé' : "Pas encore d'article"} action={q ? { href: '/actualites', label: 'Voir toutes les actualités' } : undefined}>
              {q ? 'Essayez un autre mot-clé.' : 'Les nouvelles du club seront publiées ici.'}
            </Vide>
          </div>
        ) : (
          <div className="mt-2">
            {liste.map((a, i) => <LigneActu key={a.id} a={a} i={i} />)}
          </div>
        )}

        {pages > 1 && (
          <nav aria-label="Pages des actualités" className="mt-8 flex flex-wrap gap-1.5">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <Link key={p} href={lien(p)} aria-current={p === page ? 'page' : undefined}
                className={`min-w-10 h-10 px-2 flex items-center justify-center font-display text-lg ${p === page ? 'bg-nuit text-white' : 'bg-bande text-white hover:bg-bande-fonce'}`}>
                <span className="sr-only">Page </span>{p}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
