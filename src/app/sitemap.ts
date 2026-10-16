import type { MetadataRoute } from 'next';
import { getActualites, getEquipesClub } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL ?? 'http://localhost:3000';
  const [equipes, actus] = await Promise.all([getEquipesClub(), getActualites()]);
  const pages = ['', '/equipes', '/calendrier', '/actualites', '/entrainements', '/club', '/partenaires', '/inscriptions', '/contact'];
  return [
    ...pages.map((p) => ({ url: `${base}${p}` })),
    ...equipes.map((e) => ({ url: `${base}/equipes/${e.id}` })),
    ...actus.map((a) => ({ url: `${base}/actualites/${a.id}`, lastModified: a.datePub })),
  ];
}
