'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Logo from './Logo';
import { NAV } from '@/lib/site';

export default function Header() {
  const pathname = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const actif = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 bg-nuit/95 backdrop-blur text-white border-b border-white/10">
      <div className="max-w-[1400px] mx-auto px-4 md:px-10 h-20 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 shrink-0" onClick={() => setOuvert(false)}>
          <Logo size={52} />
          <span className="leading-none">
            <span className="font-display text-2xl tracking-wide block">AJSO</span>
            <span className="font-mono text-[10px] tracking-[0.3em] text-glacier">HANDBALL</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 font-semibold text-sm uppercase tracking-wide" aria-label="Navigation principale">
          {NAV.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`relative py-2 transition-colors ${actif(l.href) ? 'text-white' : 'text-white/60 hover:text-white'}`}
            >
              {l.label}
              {actif(l.href) && <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-jaune" />}
            </Link>
          ))}
          <Link href="/inscriptions" className="bg-jaune text-nuit px-5 py-2.5 font-display tracking-wider hover:bg-white transition-colors">
            S&apos;inscrire
          </Link>
        </nav>

        <button
          type="button"
          className="lg:hidden p-2 -mr-2"
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
        <nav id="menu-mobile" className="lg:hidden border-t border-white/10 bg-nuit px-4 pb-6" aria-label="Navigation mobile">
          {[...NAV, { href: '/contact', label: 'Contact' }].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOuvert(false)}
              className={`block py-3.5 font-display text-2xl uppercase border-b border-white/5 ${actif(l.href) ? 'text-jaune' : ''}`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/inscriptions"
            onClick={() => setOuvert(false)}
            className="mt-5 block text-center bg-jaune text-nuit py-3.5 font-display text-xl tracking-wider"
          >
            S&apos;inscrire
          </Link>
        </nav>
      )}
    </header>
  );
}
