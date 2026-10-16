'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Photo } from '@/lib/types';

/** Grille de photos + visionneuse plein écran (flèches clavier, Échap, balayage). */
export default function Visionneuse({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const [depart, setDepart] = useState<number | null>(null);
  const aller = useCallback((pas: number) => setIndex((i) => (i === null ? i : (i + pas + photos.length) % photos.length)), [photos.length]);

  useEffect(() => {
    if (index === null) return;
    const touche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIndex(null);
      if (e.key === 'ArrowRight') aller(1);
      if (e.key === 'ArrowLeft') aller(-1);
    };
    document.addEventListener('keydown', touche);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', touche); document.body.style.overflow = ''; };
  }, [index, aller]);

  const courante = index !== null ? photos[index] : null;

  return (
    <>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-3 [&>*]:mb-3">
        {photos.map((p, i) => (
          <button key={p.id} type="button" onClick={() => setIndex(i)} className="block w-full group relative overflow-hidden break-inside-avoid" aria-label={p.legende ?? `Photo ${i + 1}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt={p.legende ?? ''} loading="lazy" className="w-full h-auto group-hover:scale-105 transition-transform duration-500" />
          </button>
        ))}
      </div>

      {courante && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Visionneuse"
          className="fixed inset-0 z-[100] bg-nuit/95 flex items-center justify-center"
          onClick={() => setIndex(null)}
          onTouchStart={(e) => setDepart(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (depart === null) return;
            const dx = e.changedTouches[0].clientX - depart;
            if (Math.abs(dx) > 50) aller(dx < 0 ? 1 : -1);
            setDepart(null);
          }}
        >
          <figure className="max-w-[92vw] max-h-[88vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={courante.url} alt={courante.legende ?? ''} className="max-w-full max-h-[80vh] object-contain shadow-2xl" />
            <figcaption className="text-white/80 mt-4 text-center">
              {courante.legende} <span className="font-mono text-xs text-white/40 ml-2">{index! + 1} / {photos.length}</span>
            </figcaption>
          </figure>
          <button type="button" aria-label="Fermer" onClick={() => setIndex(null)} className="absolute top-4 right-5 text-white text-4xl leading-none p-2 hover:text-jaune">×</button>
          {photos.length > 1 && (
            <>
              <button type="button" aria-label="Précédente" onClick={(e) => { e.stopPropagation(); aller(-1); }} className="absolute left-2 md:left-6 text-white text-5xl p-3 hover:text-jaune">‹</button>
              <button type="button" aria-label="Suivante" onClick={(e) => { e.stopPropagation(); aller(1); }} className="absolute right-2 md:right-6 text-white text-5xl p-3 hover:text-jaune">›</button>
            </>
          )}
        </div>
      )}
    </>
  );
}
