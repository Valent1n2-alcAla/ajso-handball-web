'use client';

import { useRef, useState } from 'react';
import { televerser } from '@/app/admin/actions';
import { preparerImage } from '@/lib/redimension';

/** Champ image : envoi d'un fichier (réduit dans le navigateur) ou URL collée. */
export default function ChampImage({ nom, valeur }: { nom: string; valeur: string }) {
  const [url, setUrl] = useState(valeur);
  const [etat, setEtat] = useState<{ enCours?: boolean; erreur?: string }>({});
  const fichierRef = useRef<HTMLInputElement>(null);

  async function choisir(fichier?: File) {
    if (!fichier) return;
    setEtat({ enCours: true });
    try {
      const fd = new FormData();
      fd.append('fichier', await preparerImage(fichier));
      const r = await televerser(fd);
      if (r.url) setUrl(r.url);
      setEtat({ erreur: r.erreur });
    } catch {
      setEtat({ erreur: "L'envoi a échoué (fichier trop lourd ?)." });
    }
    if (fichierRef.current) fichierRef.current.value = '';
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start">
      <div className="w-32 h-24 shrink-0 bg-papier border border-nuit/10 flex items-center justify-center overflow-hidden">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="w-full h-full object-cover" />
        ) : <span className="text-xs text-nuit/40">Aucune image</span>}
      </div>
      <div className="flex-1 w-full space-y-2">
        <input type="hidden" name={nom} value={url} />
        <div className="flex flex-wrap gap-2">
          <label className={`cursor-pointer bg-nuit text-white px-4 py-2 text-sm hover:bg-roi ${etat.enCours ? 'opacity-50 pointer-events-none' : ''}`}>
            {etat.enCours ? 'Envoi…' : url ? 'Remplacer' : 'Choisir une image'}
            <input ref={fichierRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(e) => choisir(e.target.files?.[0])} />
          </label>
          {url && <button type="button" onClick={() => setUrl('')} className="px-4 py-2 text-sm text-rose-600 hover:underline">Retirer</button>}
        </div>
        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="…ou collez une adresse d'image"
          className="w-full bg-white border border-nuit/15 focus:border-violet outline-none px-3 py-2 text-sm" aria-label="Adresse de l'image" />
        {etat.erreur && <p className="text-sm text-rose-600">{etat.erreur}</p>}
      </div>
    </div>
  );
}
