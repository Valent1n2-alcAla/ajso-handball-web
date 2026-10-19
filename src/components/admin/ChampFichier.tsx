'use client';

import { useRef, useState } from 'react';
import { televerser } from '@/app/admin/actions';
import { preparerImage } from '@/lib/redimension';

const nomFichier = (url: string) => decodeURIComponent(url.split('/').pop() ?? url);

/** Champ document : envoi d'un PDF (tel quel) ou d'une image (réduite dans le navigateur), ou URL collée. */
export default function ChampFichier({ nom, valeur, requis }: { nom: string; valeur: string; requis?: boolean }) {
  const [url, setUrl] = useState(valeur);
  const [etat, setEtat] = useState<{ enCours?: boolean; erreur?: string }>({});
  const fichierRef = useRef<HTMLInputElement>(null);
  const pdf = /\.pdf($|\?)/i.test(url);

  async function choisir(fichier?: File) {
    if (!fichier) return;
    setEtat({ enCours: true });
    try {
      const fd = new FormData();
      fd.append('fichier', fichier.type === 'application/pdf' ? fichier : await preparerImage(fichier));
      fd.append('documents', '1');
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
        {!url ? <span className="text-xs text-nuit/40">Aucun fichier</span> : pdf ? (
          <span className="flex flex-col items-center gap-1 text-rose-700">
            <svg aria-hidden viewBox="0 0 24 24" className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M14 3H6v18h12V7z" /><path d="M14 3v4h4" /></svg>
            <span className="font-mono text-[10px] font-bold">PDF</span>
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex-1 w-full space-y-2">
        <input type="hidden" name={nom} value={url} />
        <div className="flex flex-wrap items-center gap-2">
          <label className={`cursor-pointer bg-nuit text-white px-4 py-2 text-sm hover:bg-roi ${etat.enCours ? 'opacity-50 pointer-events-none' : ''}`}>
            {etat.enCours ? 'Envoi…' : url ? 'Remplacer' : 'Choisir un fichier'}
            <input ref={fichierRef} type="file" accept="application/pdf,image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(e) => choisir(e.target.files?.[0])} />
          </label>
          {url && <a href={url} target="_blank" rel="noopener noreferrer" className="px-2 py-2 text-sm text-roi hover:underline break-all">Ouvrir {nomFichier(url)}</a>}
          {url && <button type="button" onClick={() => setUrl('')} className="px-2 py-2 text-sm text-rose-600 hover:underline">Retirer</button>}
        </div>
        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="…ou collez l'adresse du document" required={requis}
          className="w-full bg-white border border-nuit/15 focus:border-violet outline-none px-3 py-2 text-sm" aria-label="Adresse du document" />
        {etat.erreur && <p className="text-sm text-rose-600">{etat.erreur}</p>}
      </div>
    </div>
  );
}
