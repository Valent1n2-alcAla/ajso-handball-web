'use client';

import { useRef } from 'react';
import { TuilePartenaire } from './BannierePartenaires';
import { Chevron } from './ui';
import type { Partenaire } from '@/lib/types';

/** Rangée de logos partenaires défilante (balayage, flèches carrées). */
export default function CarrouselPartenaires({ partenaires }: { partenaires: Partenaire[] }) {
  const rangee = useRef<HTMLUListElement>(null);
  const defiler = (sens: 1 | -1) => {
    const el = rangee.current;
    if (!el) return;
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: sens * el.clientWidth * 0.8, behavior: reduit ? 'auto' : 'smooth' });
  };
  const fleche = 'shrink-0 w-9 h-9 bg-bande text-white flex items-center justify-center hover:bg-bande-fonce';

  return (
    <div className="flex items-center gap-3 md:gap-5">
      <button type="button" onClick={() => defiler(-1)} className={fleche} aria-label="Partenaires précédents"><Chevron sens="gauche" className="w-2.5 h-3.5" /></button>
      <ul ref={rangee} className="rangee-defilante flex-1 min-w-0 flex gap-5 md:gap-8 overflow-x-auto snap-x snap-mandatory py-2">
        {partenaires.map((p) => (
          <li key={p.id} className="snap-start shrink-0 w-[calc(50%-10px)] sm:w-[calc(33.333%-14px)] lg:w-[calc(20%-26px)]">
            {p.url ? (
              <a href={p.url} target="_blank" rel="noopener noreferrer" aria-label={`${p.nom} (site du partenaire, nouvel onglet)`} className="block border border-filet hover:border-bande">
                <TuilePartenaire p={p} hauteur="h-28" />
              </a>
            ) : (
              <div className="border border-filet"><TuilePartenaire p={p} hauteur="h-28" /></div>
            )}
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => defiler(1)} className={fleche} aria-label="Partenaires suivants"><Chevron className="w-2.5 h-3.5" /></button>
    </div>
  );
}
