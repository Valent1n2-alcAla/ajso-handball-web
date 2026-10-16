/**
 * Réduit une photo côté navigateur avant l'envoi : 2000 px max, JPEG qualité 0,85.
 * Les petites images (logos PNG, GIF) sont envoyées telles quelles.
 */
export async function preparerImage(fichier: File, max = 2000): Promise<File> {
  if (!fichier.type.startsWith('image/') || fichier.type === 'image/gif') return fichier;
  if (fichier.size < 1_500_000 && fichier.type !== 'image/jpeg') return fichier;

  const bitmap = await createImageBitmap(fichier).catch(() => null);
  if (!bitmap) return fichier;
  const echelle = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  if (echelle === 1 && fichier.size < 1_500_000) return fichier;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * echelle);
  canvas.height = Math.round(bitmap.height * echelle);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/jpeg', 0.85));
  if (!blob || blob.size >= fichier.size) return fichier;
  return new File([blob], fichier.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
}
