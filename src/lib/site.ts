import type { Club, Equipe } from './types';

/** Logo officiel du club (fond transparent). */
export const LOGO_SRC = '/logo-ajso.png';
/** Proportions du logo (largeur / hauteur). */
export const LOGO_RATIO = 668 / 592;

export type LienNav = { href: string; label: string };

/** Menu « Club » : la vie du club (5 premiers liens) puis la saison */
export const NAV_CLUB: LienNav[] = [
  { href: '/club', label: 'Présentation' },
  { href: '/entrainements', label: 'Entraînements' },
  { href: '/inscriptions', label: 'Inscriptions' },
  { href: '/benevoles', label: 'Bénévoles' },
  { href: '/boutique', label: 'Boutique' },
  { href: '/agenda', label: 'Agenda' },
  { href: '/galerie', label: 'Galerie' },
  { href: '/classements', label: 'Classements' },
  { href: '/calendrier', label: 'Calendrier' },
];

/** Une colonne du méga-menu : un titre (équipe ou tranche d'âge) et ses liens. */
export type ColonneMenu = { titre: string; href?: string; equipes: { titre: string; href: string; liens: LienNav[] }[] };

/** Rubrique du menu principal : lien simple ou panneau déroulant. */
export type RubriqueNav =
  | { type: 'lien'; label: string; href: string }
  | { type: 'panneau'; label: string; colonnes: ColonneMenu[]; actifs: string[]; tout?: LienNav };

/** Liens d'une fiche équipe (ancres de la page /equipes/[id]). */
export function liensEquipe(e: Pick<Equipe, 'id' | 'championnat'>): LienNav[] {
  const base = `/equipes/${e.id}`;
  return [
    { href: `${base}#presentation`, label: 'Présentation' },
    { href: `${base}#effectif`, label: 'Effectif et staff' },
    { href: `${base}#calendrier`, label: 'Calendrier / Résultats' },
    ...(e.championnat ? [{ href: `${base}#classement`, label: 'Classement' }] : []),
  ];
}

const sansAccents = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/** Famille d'une équipe dans le menu : séniors masculins, séniors féminines ou jeunes. */
export function familleEquipe(e: Pick<Equipe, 'nom' | 'categorie'>): 'seniors-m' | 'seniors-f' | 'jeunes' {
  const cat = sansAccents(`${e.categorie?.nom ?? ''} ${e.nom}`);
  const tranche = sansAccents(e.categorie?.tranche?.nom ?? '');
  const senior = /senior|adulte|loisir/.test(cat) || tranche === 'adultes';
  if (!senior) return 'jeunes';
  return /femin|fille|dame/.test(cat) ? 'seniors-f' : 'seniors-m';
}

/** Tranche d'âge d'une équipe jeune : « -17 ans », « Baby hand »… et son rang (plus âgés d'abord). */
export function ageEquipe(e: Pick<Equipe, 'nom' | 'categorie'>): { libelle: string; rang: number } {
  const texte = `${e.categorie?.nom ?? ''} ${e.nom}`;
  const age = texte.match(/-\s?(\d{1,2})\b/);
  if (age) return { libelle: `-${age[1]} ans`, rang: 100 - Number(age[1]) };
  if (/baby/i.test(texte)) return { libelle: 'Baby hand', rang: 200 };
  return { libelle: e.categorie?.nom ?? 'Autres', rang: 300 };
}

const parOrdre = (a: Equipe, b: Equipe) => (a.ordre ?? 0) - (b.ordre ?? 0) || a.nom.localeCompare(b.nom, 'fr');

/** Menu principal : rubriques et panneaux des équipes, construits à partir des équipes du club. */
export function construireNav(equipes: Equipe[]): RubriqueNav[] {
  const tri = [...equipes].sort(parOrdre);
  const colonneEquipe = (e: Equipe): ColonneMenu => ({ titre: e.nom, href: `/equipes/${e.id}`, equipes: [{ titre: e.nom, href: `/equipes/${e.id}`, liens: liensEquipe(e) }] });
  const actifs = (liste: Equipe[]) => liste.map((e) => `/equipes/${e.id}`);

  const masc = tri.filter((e) => familleEquipe(e) === 'seniors-m');
  const fem = tri.filter((e) => familleEquipe(e) === 'seniors-f');
  const jeunes = tri.filter((e) => familleEquipe(e) === 'jeunes');

  // Équipes jeunes : une colonne par tranche d'âge, des plus âgés au Baby hand
  const ages = new Map<string, { rang: number; equipes: Equipe[] }>();
  for (const e of jeunes) {
    const { libelle, rang } = ageEquipe(e);
    const g = ages.get(libelle) ?? { rang, equipes: [] };
    g.equipes.push(e);
    ages.set(libelle, g);
  }
  const colonnesJeunes: ColonneMenu[] = [...ages.entries()]
    .sort(([, a], [, b]) => a.rang - b.rang)
    .map(([titre, g]) => ({ titre, equipes: g.equipes.map((e) => ({ titre: e.nom, href: `/equipes/${e.id}`, liens: liensEquipe(e) })) }));

  const rubriques: RubriqueNav[] = [
    { type: 'lien', label: 'Contact', href: '/contact' },
    { type: 'lien', label: 'Actu', href: '/actualites' },
  ];
  if (masc.length) rubriques.push({ type: 'panneau', label: 'Séniors masculins', colonnes: masc.map(colonneEquipe), actifs: actifs(masc) });
  if (fem.length) rubriques.push({ type: 'panneau', label: 'Séniors féminines', colonnes: fem.map(colonneEquipe), actifs: actifs(fem) });
  if (jeunes.length) {
    rubriques.push({ type: 'panneau', label: 'Équipes jeunes', colonnes: colonnesJeunes, actifs: actifs(jeunes), tout: { href: '/equipes', label: 'Toutes les équipes' } });
  }
  rubriques.push(
    {
      type: 'panneau',
      label: 'Club',
      colonnes: [
        { titre: 'Le club', equipes: [{ titre: 'Le club', href: '/club', liens: NAV_CLUB.slice(0, 5) }] },
        { titre: 'La saison', equipes: [{ titre: 'La saison', href: '/calendrier', liens: NAV_CLUB.slice(5) }] },
      ],
      actifs: NAV_CLUB.map((l) => l.href),
    },
    { type: 'lien', label: 'Partenaires', href: '/partenaires' },
  );
  return rubriques;
}

export type Reseau = { nom: 'Facebook' | 'Instagram' | 'YouTube' | 'TikTok' | 'X' | 'LinkedIn'; href: string };

const HOTES: [RegExp, Reseau['nom']][] = [
  [/(^|\.)facebook\.com$|(^|\.)fb\.com$/, 'Facebook'],
  [/(^|\.)instagram\.com$/, 'Instagram'],
  [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/, 'YouTube'],
  [/(^|\.)tiktok\.com$/, 'TikTok'],
  [/(^|\.)(x|twitter)\.com$/, 'X'],
  [/(^|\.)linkedin\.com$/, 'LinkedIn'],
];

/** Réseaux sociaux du club : champs Facebook / Instagram, puis URL reconnues dans le champ libre « réseaux ». */
export function reseauxClub(club: Pick<Club, 'facebook' | 'instagram' | 'reseaux'> | null): Reseau[] {
  if (!club) return [];
  const urls = [club.facebook, club.instagram, ...(club.reseaux?.match(/https?:\/\/[^\s,;]+/g) ?? [])].filter((u): u is string => !!u);
  const liste: Reseau[] = [];
  for (const href of urls) {
    let hote = '';
    try {
      const u = new URL(href);
      if (u.protocol !== 'https:' && u.protocol !== 'http:') continue;
      hote = u.hostname.replace(/^www\./, '');
    } catch {
      continue;
    }
    const nom = HOTES.find(([re]) => re.test(hote))?.[1];
    if (nom && !liste.some((r) => r.nom === nom)) liste.push({ nom, href });
  }
  return liste;
}
