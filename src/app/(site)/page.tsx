import Link from 'next/link';
import Logo from '@/components/Logo';
import { CarteActu, VisuelActu } from '@/components/Actualite';
import { TableauMatchs } from '@/components/Match';
import { BoutonLien, Chevron, CONTENEUR, EnTete, Vide } from '@/components/ui';
import { getActualites, getDerniersResultats, getProchainsMatchs } from '@/lib/api';
import { FUSEAU } from '@/lib/format';
import { saisonCourante } from '@/lib/saison';

type Panneau = { href: string; titre: string; image?: string | null };

export default async function Accueil() {
  const [actus, prochains, resultats] = await Promise.all([getActualites(), getProchainsMatchs(), getDerniersResultats()]);
  const saison = saisonCourante();

  // Bandeau d'images : les 3 dernières actualités, complétées par les rubriques clés du club
  const panneaux: Panneau[] = [
    ...actus.slice(0, 3).map((a) => ({ href: `/actualites/${a.id}`, titre: a.titre, image: a.image })),
    { href: '/inscriptions', titre: `Inscriptions ${saison}` },
    { href: '/entrainements', titre: "Créneaux d'entraînement" },
    { href: '/calendrier', titre: 'Calendrier des matchs' },
  ].slice(0, 3);

  const date = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', timeZone: FUSEAU });

  return (
    <>
      <h1 className="sr-only">AJS Ouistreham Handball, site officiel</h1>

      {/* ===== BANDEAU D'IMAGES ===== */}
      <section aria-label="À la une" className="rangee-defilante flex overflow-x-auto snap-x snap-mandatory md:overflow-visible">
        {panneaux.map((p, i) => (
          <Link key={p.href} href={p.href} className="group relative shrink-0 w-[88%] sm:w-1/2 md:w-1/3 h-[230px] sm:h-[280px] lg:h-[350px] snap-start border-r-2 border-white last:border-r-0">
            <VisuelActu a={p} variante={i} logo={200} prioritaire={i === 0} sizes="(min-width: 768px) 33vw, 88vw" />
            <span className="absolute inset-x-0 bottom-0 bg-bande/90 group-hover:bg-bande px-5 md:px-7 py-4 min-h-[64px] flex items-center">
              <span className="font-display uppercase text-white text-lg md:text-[1.3rem] leading-tight line-clamp-2">{p.titre}</span>
            </span>
          </Link>
        ))}
      </section>

      {/* ===== ACTUALITÉS + FIL INFOS ===== */}
      <div className={`${CONTENEUR} pt-8 md:pt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_270px]`}>
        <section aria-labelledby="titre-actus">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 mb-5">
            <h2 id="titre-actus" className="font-display text-[1.75rem] md:text-[2.1rem] uppercase leading-tight text-bande">Actualités</h2>
            <BoutonLien href="/actualites" taille="sm">Voir toutes les actualités<Chevron className="w-2 h-2.5" /></BoutonLien>
          </div>
          {actus.length === 0 ? <Vide>Les articles du club seront publiés ici.</Vide> : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              {actus.slice(0, 3).map((a, i) => <CarteActu key={a.id} a={a} i={i + 1} />)}
            </div>
          )}
        </section>

        <section aria-labelledby="titre-fil">
          <h2 id="titre-fil" className="font-display text-[1.75rem] md:text-[2.1rem] uppercase leading-tight text-bande mb-4">Fil infos</h2>
          {actus.length === 0 ? <p className="text-[14px] text-encre/75">Aucune information pour le moment.</p> : (
            <ul className="border-t border-filet">
              {actus.slice(0, 7).map((a) => (
                <li key={a.id} className="border-b border-filet">
                  <Link href={`/actualites/${a.id}`} className="flex gap-3 py-3 text-[14px] hover:text-bande-fonce group">
                    <time dateTime={a.datePub} className="shrink-0 tabular-nums">{date(a.datePub)}</time>
                    <span className="truncate group-hover:underline">{a.titre}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ===== MATCHS ===== */}
      <div className={`${CONTENEUR} pt-10 grid gap-10 md:grid-cols-2`}>
        <section aria-labelledby="titre-prochains">
          <EnTete titre={<span id="titre-prochains">Prochains matchs</span>} action={{ href: '/calendrier', label: 'Calendrier' }} />
          {prochains.length === 0 ? <Vide>Aucun match programmé pour le moment.</Vide> : (
            <TableauMatchs matchs={prochains.slice(0, 6)} legende="Prochains matchs" />
          )}
        </section>
        <section aria-labelledby="titre-resultats">
          <EnTete titre={<span id="titre-resultats">Derniers résultats</span>} action={{ href: '/calendrier?vue=resultats', label: 'Tous les résultats' }} />
          {resultats.length === 0 ? <Vide>Les scores seront publiés après les premiers matchs.</Vide> : (
            <TableauMatchs matchs={resultats.slice(0, 6)} legende="Derniers résultats" />
          )}
        </section>
      </div>

      {/* ===== TUILES ===== */}
      <div className={`${CONTENEUR} pt-12 grid gap-4 md:grid-cols-[1fr_1fr_0.7fr]`}>
        <Tuile href="/inscriptions" fond="bg-bande" titre="Adhésion" sous={saison} />
        <Tuile href="/partenaires" fond="bg-nuit" titre="Devenez partenaire" sous="de l'AJSO Handball" cadre />
        <Tuile href="/boutique" fond="bg-bande-fonce" titre="Boutique" sous="Aux couleurs du club" />
      </div>
    </>
  );
}

/** Tuile de rubrique : aplat de couleur, logo en filigrane, titre en capitales. */
function Tuile({ href, fond, titre, sous, cadre = false }: { href: string; fond: string; titre: string; sous: string; cadre?: boolean }) {
  return (
    <Link href={href} className={`group relative overflow-hidden h-[150px] md:h-[240px] ${fond} text-white flex items-center justify-center text-center`}>
      <span aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 opacity-15"><Logo size={190} decoratif /></span>
      <span className={`relative px-5 py-3 ${cadre ? 'border-2 border-white' : ''}`}>
        <span className="block font-display uppercase text-[2rem] md:text-[2.3rem] leading-none group-hover:underline">{titre}</span>
        <span className="block font-display uppercase text-lg md:text-xl mt-1">{sous}</span>
      </span>
    </Link>
  );
}
