import Link from 'next/link';
import type { ReactNode } from 'react';

export function PageHero({ surtitre, titre, children }: { surtitre: string; titre: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative bg-nuit text-white overflow-hidden motif-losanges clip-diagonale">
      <div aria-hidden className="absolute -right-32 -top-32 w-[520px] h-[520px] rotate-45 bg-losange opacity-40" />
      <div className="relative max-w-[1400px] mx-auto px-4 md:px-10 pt-16 pb-24 md:pt-24 md:pb-32">
        <p className="font-mono text-xs tracking-[0.35em] uppercase text-jaune mb-4">{surtitre}</p>
        <h1 className="font-display text-5xl md:text-8xl uppercase leading-[0.9]">{titre}</h1>
        {children && <div className="mt-6 max-w-2xl text-white/70 text-lg">{children}</div>}
      </div>
    </section>
  );
}

export function Section({ id, titre, action, children, className = '', sombre = false }: {
  id?: string; titre?: ReactNode; action?: { href: string; label: string }; children: ReactNode; className?: string; sombre?: boolean;
}) {
  return (
    <section id={id} className={`max-w-[1400px] mx-auto px-4 md:px-10 py-16 md:py-24 ${className}`}>
      {(titre || action) && (
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10 md:mb-14">
          {titre && <h2 className="font-display text-4xl md:text-6xl uppercase leading-none">{titre}</h2>}
          {action && (
            <Link href={action.href} className={`font-display uppercase tracking-wide ${sombre ? 'text-jaune hover:text-white' : 'text-roi hover:text-violet'}`}>
              {action.label} →
            </Link>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

export function Vide({ children }: { children: ReactNode }) {
  return (
    <div className="border-2 border-dashed border-nuit/10 p-10 md:p-14 text-center text-nuit/50">{children}</div>
  );
}

export function Badge({ children, ton = 'roi' }: { children: ReactNode; ton?: 'roi' | 'violet' | 'jaune' | 'gris' }) {
  const tons = {
    roi: 'bg-roi/10 text-roi',
    violet: 'bg-violet/10 text-violet',
    jaune: 'bg-jaune text-nuit',
    gris: 'bg-nuit/5 text-nuit/60',
  };
  return <span className={`inline-block font-mono text-[11px] uppercase tracking-widest px-2.5 py-1 ${tons[ton]}`}>{children}</span>;
}

export function BoutonLien({ href, children, variante = 'jaune' }: { href: string; children: ReactNode; variante?: 'jaune' | 'contour' | 'nuit' }) {
  const v = {
    jaune: 'bg-jaune text-nuit hover:bg-white',
    contour: 'border-2 border-white/30 text-white hover:border-jaune hover:text-jaune',
    nuit: 'bg-nuit text-white hover:bg-roi',
  };
  return (
    <Link href={href} className={`inline-block font-display uppercase tracking-wider text-lg px-7 py-3.5 transition-colors ${v[variante]}`}>
      {children}
    </Link>
  );
}
