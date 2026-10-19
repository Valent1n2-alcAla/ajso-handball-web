/** Logo officiel du club (fond transparent). */
export const LOGO_SRC = '/logo-ajso.png';
/** Proportions du logo (largeur / hauteur). */
export const LOGO_RATIO = 668 / 592;

export type LienNav = { href: string; label: string };

export const NAV: LienNav[] = [
  { href: '/equipes', label: 'Équipes' },
  { href: '/calendrier', label: 'Calendrier' },
  { href: '/classements', label: 'Classements' },
  { href: '/actualites', label: 'Actualités' },
  { href: '/agenda', label: 'Agenda' },
  { href: '/galerie', label: 'Galerie' },
];

/** Sous-menu « Le club » */
export const NAV_CLUB: LienNav[] = [
  { href: '/club', label: 'Présentation' },
  { href: '/entrainements', label: 'Entraînements' },
  { href: '/inscriptions', label: 'Inscriptions' },
  { href: '/benevoles', label: 'Bénévoles' },
  { href: '/boutique', label: 'Boutique' },
  { href: '/partenaires', label: 'Partenaires' },
  { href: '/contact', label: 'Contact' },
];
