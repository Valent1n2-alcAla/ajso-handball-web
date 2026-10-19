import Link from 'next/link';
import type { ReactNode } from 'react';

/** Petit losange décoratif (puce de titre, séparateur). */
export function Losange({ className = 'w-3 h-3 bg-jaune' }: { className?: string }) {
  return <span aria-hidden className={`inline-block shrink-0 rotate-45 ${className}`} />;
}

/** Surtitre en capitales mono, précédé d'un trait. */
export function Surtitre({ children, className = 'text-jaune' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-3 font-mono text-[11px] md:text-xs tracking-[0.3em] uppercase ${className}`}>
      <span aria-hidden className="w-8 h-0.5 bg-current" />
      {children}
    </p>
  );
}

export function PageHero({ surtitre, titre, children }: { surtitre: string; titre: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative bg-nuit text-white overflow-hidden motif-losanges clip-diagonale">
      <div aria-hidden className="absolute -right-40 -top-40 md:-right-24 md:-top-48 w-[420px] md:w-[620px] aspect-square rotate-45 bg-losange opacity-50" />
      <div aria-hidden className="absolute right-24 -bottom-20 w-40 aspect-square rotate-45 border-2 border-glacier/25 hidden md:block" />
      <div aria-hidden className="absolute right-[22rem] top-16 w-5 aspect-square rotate-45 bg-jaune hidden lg:block" />
      <div className="relative max-w-[1400px] mx-auto px-4 md:px-10 pt-14 pb-24 md:pt-24 md:pb-32 animate-apparition">
        <Surtitre className="text-jaune mb-6">{surtitre}</Surtitre>
        <h1 className="font-display text-[3.25rem] sm:text-7xl md:text-8xl uppercase leading-[1.03] pt-2 break-words">{titre}</h1>
        {children && <div className="mt-6 max-w-2xl text-white/75 text-lg">{children}</div>}
      </div>
    </section>
  );
}

/** En-tête de section homogène : surtitre, grand titre, lien d'action. */
export function EnTete({ surtitre, titre, action, sombre = false, as: Titre = 'h2' }: {
  surtitre?: string; titre: ReactNode; action?: { href: string; label: string }; sombre?: boolean; as?: 'h2' | 'h3';
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 mb-10 md:mb-12">
      <div>
        {surtitre && <Surtitre className={`mb-4 ${sombre ? 'text-jaune' : 'text-violet'}`}>{surtitre}</Surtitre>}
        <Titre className="font-display text-[2.6rem] md:text-6xl uppercase leading-[1.02] pt-1">{titre}</Titre>
      </div>
      {action && <LienFleche href={action.href} sombre={sombre}>{action.label}</LienFleche>}
    </div>
  );
}

/** Lien texte avec flèche animée au survol. */
export function LienFleche({ href, children, sombre = false }: { href: string; children: ReactNode; sombre?: boolean }) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 font-display uppercase tracking-wide text-base md:text-lg transition-colors ${sombre ? 'text-jaune hover:text-white' : 'text-roi hover:text-violet'}`}
    >
      {children}
      <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
    </Link>
  );
}

export function Section({ id, titre, surtitre, action, children, className = '', sombre = false }: {
  id?: string; titre?: ReactNode; surtitre?: string; action?: { href: string; label: string }; children: ReactNode; className?: string; sombre?: boolean;
}) {
  return (
    <section id={id} className={`max-w-[1400px] mx-auto px-4 md:px-10 py-16 md:py-24 ${className}`}>
      {titre && <EnTete surtitre={surtitre} titre={titre} action={action} sombre={sombre} />}
      {children}
    </section>
  );
}

/** État vide soigné : losange, message, action éventuelle. */
export function Vide({ children, titre, action, sombre = false }: {
  children: ReactNode; titre?: string; action?: { href: string; label: string }; sombre?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden px-6 py-12 md:py-16 text-center ${sombre ? 'bg-white/[0.04] border border-white/10 text-white/70' : 'bg-papier text-nuit/65'}`}>
      <div aria-hidden className="relative mx-auto mb-6 w-14 h-14">
        <span className={`absolute inset-0 rotate-45 ${sombre ? 'border-2 border-white/20' : 'border-2 border-nuit/10'}`} />
        <span className="absolute inset-3 rotate-45 bg-losange" />
      </div>
      {titre && <p className={`font-display text-2xl uppercase mb-2 ${sombre ? 'text-white' : 'text-nuit'}`}>{titre}</p>}
      <div className="max-w-md mx-auto">{children}</div>
      {action && <div className="mt-6"><LienFleche href={action.href} sombre={sombre}>{action.label}</LienFleche></div>}
    </div>
  );
}

export function Badge({ children, ton = 'roi' }: { children: ReactNode; ton?: 'roi' | 'violet' | 'jaune' | 'gris' }) {
  const tons = {
    roi: 'bg-roi/10 text-roi',
    violet: 'bg-violet/10 text-violet',
    jaune: 'bg-jaune text-nuit',
    gris: 'bg-nuit/5 text-nuit/70',
  };
  return <span className={`inline-block font-mono text-[11px] uppercase tracking-widest px-2.5 py-1 ${tons[ton]}`}>{children}</span>;
}

export function BoutonLien({ href, children, variante = 'jaune' }: { href: string; children: ReactNode; variante?: 'jaune' | 'contour' | 'nuit' }) {
  const v = {
    jaune: 'bg-jaune text-nuit hover:bg-white shadow-[0_10px_30px_-10px_rgba(255,198,41,0.6)]',
    contour: 'border-2 border-white/40 text-white hover:border-jaune hover:text-jaune',
    nuit: 'bg-nuit text-white hover:bg-roi',
  };
  return (
    <Link href={href} className={`inline-flex items-center justify-center font-display uppercase tracking-wider text-lg px-7 py-3.5 transition duration-200 hover:-translate-y-0.5 ${v[variante]}`}>
      {children}
    </Link>
  );
}
