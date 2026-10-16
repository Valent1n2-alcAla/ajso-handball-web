'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Logo from './Logo';
import { NAV, NAV_CLUB } from '@/lib/site';

export default function Header() {
  const pathname = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const [sousMenu, setSousMenu] = useState(false);
  const refClub = useRef<HTMLDivElement>(null);
  const actif = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const clubActif = NAV_CLUB.some((l) => actif(l.href));

  // Ferme le sous-menu au clic extérieur et sur Échap
  useEffect(() => {
    if (!sousMenu) return;
    const clic = (e: MouseEvent) => { if (!refClub.current?.contains(e.target as Node)) setSousMenu(false); };
    const touche = (e: KeyboardEvent) => { if (e.key === 'Escape') setSousMenu(false); };
    document.addEventListener('mousedown', clic);
    document.addEventListener('keydown', touche);
    return () => { document.removeEventListener('mousedown', clic); document.removeEventListener('keydown', touche); };
  }, [sousMenu]);

  const fermer = () => { setOuvert(false); setSousMenu(false); };
  const lien = (href: string) => `relative py-2 transition-colors ${actif(href) ? 'text-white' : 'text-white/60 hover:text-white'}`;

  return (
    <header className="sticky top-0 z-50 bg-nuit/95 backdrop-blur text-white border-b border-white/10">
      <div className="max-w-[1400px] mx-auto px-4 md:px-10 h-20 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 shrink-0" onClick={fermer}>
          <Logo size={52} />
          <span className="leading-none">
            <span className="font-display text-2xl tracking-wide block">AJSO</span>
            <span className="font-mono text-[10px] tracking-[0.3em] text-glacier">HANDBALL</span>
          </span>
        </Link>

        <nav className="hidden xl:flex items-center gap-6 font-semibold text-sm uppercase tracking-wide" aria-label="Navigation principale">
          {NAV.map((l) => (
            <Link key={l.href} href={l.href} className={lien(l.href)} onClick={fermer}>
              {l.label}
              {actif(l.href) && <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-jaune" />}
            </Link>
          ))}
          <div ref={refClub} className="relative">
            <button
              type="button"
              aria-expanded={sousMenu}
              aria-haspopup="true"
              onClick={() => setSousMenu((o) => !o)}
              className={`relative py-2 uppercase flex items-center gap-1.5 ${clubActif ? 'text-white' : 'text-white/60 hover:text-white'}`}
            >
              Le club
              <svg aria-hidden viewBox="0 0 10 6" className={`w-2.5 h-2.5 transition-transform ${sousMenu ? 'rotate-180' : ''}`}><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
              {clubActif && <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-jaune" />}
            </button>
            {sousMenu && (
              <div className="absolute right-0 top-full mt-3 w-60 bg-nuit border border-white/10 shadow-2xl py-2">
                {NAV_CLUB.map((l) => (
                  <Link key={l.href} href={l.href} onClick={fermer}
                    className={`block px-5 py-2.5 normal-case text-base font-medium ${actif(l.href) ? 'text-jaune' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}>
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/inscriptions" onClick={fermer} className="bg-jaune text-nuit px-5 py-2.5 font-display tracking-wider hover:bg-white transition-colors">
            S&apos;inscrire
          </Link>
        </nav>

        <button
          type="button"
          className="xl:hidden p-2 -mr-2"
          aria-expanded={ouvert}
          aria-controls="menu-mobile"
          aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setOuvert((o) => !o)}
        >
          <span className={`block w-7 h-0.5 bg-white transition-transform ${ouvert ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`block w-7 h-0.5 bg-white my-1.5 transition-opacity ${ouvert ? 'opacity-0' : ''}`} />
          <span className={`block w-7 h-0.5 bg-white transition-transform ${ouvert ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </div>

      {ouvert && (
        <nav id="menu-mobile" className="xl:hidden border-t border-white/10 bg-nuit px-4 pb-6 max-h-[calc(100vh-5rem)] overflow-y-auto" aria-label="Navigation mobile">
          {NAV.map((l) => (
            <Link key={l.href} href={l.href} onClick={fermer}
              className={`block py-3 font-display text-2xl uppercase border-b border-white/5 ${actif(l.href) ? 'text-jaune' : ''}`}>
              {l.label}
            </Link>
          ))}
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-glacier mt-5 mb-1">Le club</p>
          <div className="grid grid-cols-2 gap-x-4">
            {NAV_CLUB.map((l) => (
              <Link key={l.href} href={l.href} onClick={fermer}
                className={`block py-2.5 text-lg ${actif(l.href) ? 'text-jaune' : 'text-white/80'}`}>
                {l.label}
              </Link>
            ))}
          </div>
          <Link href="/inscriptions" onClick={fermer} className="mt-5 block text-center bg-jaune text-nuit py-3.5 font-display text-xl tracking-wider">
            S&apos;inscrire
          </Link>
        </nav>
      )}
    </header>
  );
}
