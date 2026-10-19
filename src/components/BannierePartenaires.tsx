'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ImageContenu from './ImageContenu';
import type { Partenaire } from '@/lib/types';

const PLACES = 4;

/** Logo ou nom d'un partenaire, sur un carré blanc (lisible quel que soit le logo). */
export function TuilePartenaire({ p, hauteur = 'h-full' }: { p: Pick<Partenaire, 'nom' | 'logo'>; hauteur?: string }) {
  return (
    <span className={`flex items-center justify-center bg-white px-3 ${hauteur}`}>
      {p.logo
        ? <ImageContenu src={p.logo} alt={p.nom} width={240} height={120} sizes="200px" className="max-h-[80%] w-auto max-w-full object-contain" />
        : <span className="font-display uppercase text-nuit text-center leading-tight text-[15px]">{p.nom}</span>}
    </span>
  );
}

/** Bandeau partenaires de l'en-tête : 4 emplacements, défilement automatique s'il y en a davantage. */
export default function BannierePartenaires({ partenaires }: { partenaires: Partenaire[] }) {
  const [debut, setDebut] = useState(0);
  const [pause, setPause] = useState(false);
  const tourne = partenaires.length > PLACES;

  useEffect(() => {
    if (!tourne || pause || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => setDebut((d) => (d + 1) % partenaires.length), 4000);
    return () => window.clearInterval(t);
  }, [tourne, pause, partenaires.length]);

  if (!partenaires.length) return null;
  const visibles = tourne
    ? Array.from({ length: PLACES }, (_, i) => partenaires[(debut + i) % partenaires.length])
    : partenaires;

  return (
    <div
      className="bg-nuit p-2.5 w-full max-w-[730px] h-[92px]"
      onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)}
      onFocus={() => setPause(true)} onBlur={() => setPause(false)}
    >
      <p className="sr-only">Nos partenaires</p>
      <ul className="grid gap-2.5 h-full" style={{ gridTemplateColumns: `repeat(${Math.min(PLACES, visibles.length)}, minmax(0, 1fr))` }}>
        {visibles.map((p, i) => (
          <li key={`${p.id}-${i}`} className="min-w-0">
            {p.url
              ? <a href={p.url} target="_blank" rel="noopener noreferrer" className="block h-full" aria-label={`${p.nom} (site du partenaire, nouvel onglet)`}><TuilePartenaire p={p} /></a>
              : <Link href="/partenaires" className="block h-full" aria-label={`${p.nom} (nos partenaires)`}><TuilePartenaire p={p} /></Link>}
          </li>
        ))}
      </ul>
    </div>
  );
}
