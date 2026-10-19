import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getClub, getEquipesClub, getPartenaires } from '@/lib/api';
import { construireNav, LOGO_SRC, reseauxClub } from '@/lib/site';

export default async function SiteLayout({ children }: LayoutProps<'/'>) {
  const [club, partenaires, equipes] = await Promise.all([getClub(), getPartenaires(), getEquipesClub()]);
  const reseaux = reseauxClub(club);
  const base = process.env.SITE_URL ?? 'http://localhost:3000';
  // Données structurées du club (moteurs de recherche)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: 'AJS Ouistreham Handball',
    alternateName: 'AJSO Handball',
    sport: 'Handball',
    url: base,
    logo: `${base}${LOGO_SRC}`,
    ...(club?.adresse ? { address: club.adresse } : {}),
    ...(club?.email ? { email: club.email } : {}),
    ...(club?.telephone ? { telephone: club.telephone } : {}),
    ...(reseaux.length ? { sameAs: reseaux.map((r) => r.href) } : {}),
  };
  return (
    <>
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:bg-jaune focus:text-nuit focus:px-4 focus:py-2 focus:font-semibold">
        Aller au contenu
      </a>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <Header rubriques={construireNav(equipes)} reseaux={reseaux} partenaires={partenaires} email={club?.email} />
      <main id="contenu" tabIndex={-1} className="flex-1 overflow-x-clip outline-none">{children}</main>
      <Footer club={club} partenaires={partenaires} reseaux={reseaux} />
    </>
  );
}
