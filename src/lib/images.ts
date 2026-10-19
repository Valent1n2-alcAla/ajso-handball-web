/** Origines d'images autorisées par next.config.ts (images.remotePatterns). */
const ORIGINES = (process.env.IMAGES_ORIGINES ?? '').split(' ').filter(Boolean);

/** next/image peut-il optimiser cette URL ? (fichier du site ou photo envoyée sur l'API configurée) */
export function optimisable(src: string): boolean {
  if (src.startsWith('/') && !src.startsWith('//')) return true;
  try {
    const u = new URL(src);
    return ORIGINES.includes(u.origin) && u.pathname.startsWith('/uploads/') && !u.search;
  } catch {
    return false;
  }
}
