'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import { ajouterPhoto, definirCouverture, modifierPhoto, supprimerPhoto, televerser } from '@/app/admin/actions';
import { preparerImage } from '@/lib/redimension';
import type { Photo } from '@/lib/types';

/** Photos d'un album : envoi multiple (une à une, avec progression), légende, couverture, suppression. */
export default function GestionPhotos({ albumId, photos, couverture }: { albumId: string; photos: Photo[]; couverture?: string | null }) {
  const router = useRouter();
  const [progression, setProgression] = useState<{ fait: number; total: number } | null>(null);
  const [erreurs, setErreurs] = useState<string[]>([]);
  const [, demarrer] = useTransition();
  const fichierRef = useRef<HTMLInputElement>(null);

  async function envoyer(fichiers: FileList | null) {
    if (!fichiers?.length) return;
    const liste = [...fichiers];
    const errs: string[] = [];
    let ordre = photos.length;
    setProgression({ fait: 0, total: liste.length });
    for (const [i, f] of liste.entries()) {
      try {
        const fd = new FormData();
        fd.append('fichier', await preparerImage(f));
        const r = await televerser(fd);
        const err = r.url ? (await ajouterPhoto(albumId, r.url, ordre++)).erreur : r.erreur;
        if (err) errs.push(`${f.name} : ${err}`);
      } catch {
        errs.push(`${f.name} : envoi impossible`);
      }
      setProgression({ fait: i + 1, total: liste.length });
    }
    setErreurs(errs);
    setProgression(null);
    if (fichierRef.current) fichierRef.current.value = '';
    router.refresh();
  }

  const agir = (fn: () => Promise<unknown>) => demarrer(async () => { await fn(); router.refresh(); });

  return (
    <div className="bg-white p-6 md:p-8 max-w-5xl mt-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="font-display text-3xl uppercase">Photos ({photos.length})</h2>
        <label className={`cursor-pointer bg-violet text-white font-display uppercase tracking-wide px-5 py-3 hover:bg-roi ${progression ? 'opacity-60 pointer-events-none' : ''}`}>
          {progression ? `Envoi ${progression.fait}/${progression.total}…` : '+ Ajouter des photos'}
          <input ref={fichierRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(e) => envoyer(e.target.files)} />
        </label>
      </div>
      {erreurs.length > 0 && <ul className="bg-rose-50 text-rose-700 text-sm p-4 mb-4 space-y-1">{erreurs.map((e) => <li key={e}>{e}</li>)}</ul>}
      {photos.length === 0 && <p className="text-nuit/40 text-center py-10 border-2 border-dashed border-nuit/10">Aucune photo. Sélectionnez-en plusieurs d&apos;un coup.</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((p) => (
          <figure key={p.id} className={`border ${couverture === p.url ? 'border-jaune border-2' : 'border-nuit/10'}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt="" className="w-full aspect-square object-cover" />
            <figcaption className="p-2 space-y-2">
              <input
                defaultValue={p.legende ?? ''}
                placeholder="Légende"
                aria-label="Légende"
                className="w-full text-sm border border-nuit/10 px-2 py-1"
                onBlur={(e) => { if (e.target.value !== (p.legende ?? '')) agir(() => modifierPhoto(String(p.id), { legende: e.target.value || null })); }}
              />
              <div className="flex justify-between text-xs">
                {couverture === p.url
                  ? <span className="text-nuit/60">★ Couverture</span>
                  : <button type="button" className="text-roi hover:underline" onClick={() => agir(() => definirCouverture(albumId, p.url))}>Couverture</button>}
                <button type="button" className="text-rose-600 hover:underline" onClick={() => { if (confirm('Supprimer cette photo ?')) agir(() => supprimerPhoto(String(p.id))); }}>Supprimer</button>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
