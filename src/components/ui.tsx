import Link from 'next/link';
import type { ReactNode } from 'react';

/** Largeur du contenu du site (conteneur centré). */
export const CONTENEUR = 'max-w-[1170px] mx-auto px-4 md:px-6';

/** Chevron « > » (listes, boutons, liens). */
export function Chevron({ className = 'w-2.5 h-2.5', sens = 'droite' }: { className?: string; sens?: 'droite' | 'gauche' | 'haut' | 'bas' }) {
  const rotation = { droite: '', gauche: 'rotate-180', haut: '-rotate-90', bas: 'rotate-90' }[sens];
  return (
    <svg aria-hidden viewBox="0 0 8 12" className={`shrink-0 ${rotation} ${className}`} fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M1.5 1.5L6 6l-4.5 4.5" />
    </svg>
  );
}

/** Titre de page (en haut à gauche, capitales condensées bleu nuit) et chapô éventuel. */
export function TitrePage({ titre, children, retour }: { titre: ReactNode; children?: ReactNode; retour?: { href: string; label: string } }) {
  return (
    <div className={`${CONTENEUR} pt-7 md:pt-9`}>
      {retour && (
        <Link href={retour.href} className="inline-flex items-center gap-1.5 text-sm text-bande-fonce hover:underline mb-3">
          <Chevron sens="gauche" className="w-2 h-2.5" />{retour.label}
        </Link>
      )}
      <h1 className="font-display text-[2rem] md:text-[2.4rem] uppercase leading-[1.1] text-nuit break-words">{titre}</h1>
      {children && <div className="mt-3 max-w-3xl text-[15px] leading-relaxed text-encre/85">{children}</div>}
    </div>
  );
}

/** Titre de section : capitales condensées couleur club, bouton « Voir tout » à droite. */
export function EnTete({ titre, action, as: Titre = 'h2', sombre = false, className = '' }: {
  titre: ReactNode; action?: { href: string; label: string }; as?: 'h2' | 'h3'; sombre?: boolean; className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-3 mb-5 ${className}`}>
      <Titre className={`font-display text-[1.75rem] md:text-[2.1rem] uppercase leading-tight ${sombre ? 'text-white' : 'text-bande'}`}>{titre}</Titre>
      {action && <BoutonLien href={action.href} taille="sm">{action.label}<Chevron className="w-2 h-2.5" /></BoutonLien>}
    </div>
  );
}

/** Lien texte suivi d'un chevron. */
export function LienFleche({ href, children, sombre = false }: { href: string; children: ReactNode; sombre?: boolean }) {
  return (
    <Link href={href} className={`inline-flex items-center gap-2 font-display uppercase tracking-wide hover:underline ${sombre ? 'text-white' : 'text-bande-fonce'}`}>
      {children}
      <Chevron className="w-2 h-2.5" />
    </Link>
  );
}

export function Section({ id, titre, action, children, className = '', sombre = false }: {
  id?: string; titre?: ReactNode; action?: { href: string; label: string }; children: ReactNode; className?: string; sombre?: boolean;
}) {
  return (
    <section id={id} className={`${CONTENEUR} py-8 md:py-10 ${className}`}>
      {titre && <EnTete titre={titre} action={action} sombre={sombre} />}
      {children}
    </section>
  );
}

/** État vide : simple encadré gris. */
export function Vide({ children, titre, action, sombre = false }: {
  children: ReactNode; titre?: string; action?: { href: string; label: string }; sombre?: boolean;
}) {
  return (
    <div className={`px-5 py-8 text-center ${sombre ? 'border border-white/20 text-white/80' : 'bg-papier border border-filet text-encre/80'}`}>
      {titre && <p className={`font-display text-xl uppercase mb-1 ${sombre ? 'text-white' : 'text-nuit'}`}>{titre}</p>}
      <div className="max-w-md mx-auto">{children}</div>
      {action && <div className="mt-4"><LienFleche href={action.href} sombre={sombre}>{action.label}</LienFleche></div>}
    </div>
  );
}

/** Petite étiquette (catégorie, type). */
export function Badge({ children, ton = 'bande' }: { children: ReactNode; ton?: 'bande' | 'jaune' | 'gris' | 'nuit' }) {
  const tons = {
    bande: 'bg-bande text-white',
    jaune: 'bg-jaune text-nuit',
    gris: 'bg-papier text-encre/80 border border-filet',
    nuit: 'bg-nuit text-white',
  };
  return <span className={`inline-block font-display text-[13px] uppercase tracking-wide px-2 py-0.5 ${tons[ton]}`}>{children}</span>;
}

const VARIANTES = {
  bande: 'bg-bande text-white hover:bg-bande-fonce',
  nuit: 'bg-nuit text-white hover:bg-bande-fonce',
  jaune: 'bg-jaune text-nuit hover:bg-white',
  contour: 'border-2 border-white text-white hover:bg-white hover:text-nuit',
} as const;

/** Bouton plein, angles droits, capitales condensées. */
export function BoutonLien({ href, children, variante = 'bande', taille = 'md', externe = false }: {
  href: string; children: ReactNode; variante?: keyof typeof VARIANTES; taille?: 'sm' | 'md'; externe?: boolean;
}) {
  const cls = `inline-flex items-center justify-center gap-2.5 font-display uppercase tracking-wide transition-colors ${taille === 'sm' ? 'text-[15px] px-3.5 py-1.5' : 'text-lg px-6 py-2.5'} ${VARIANTES[variante]}`;
  return externe
    ? <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>
    : <Link href={href} className={cls}>{children}</Link>;
}

/** Bloc titré sobre (encadré à filet) pour les colonnes latérales. */
export function Encadre({ titre, children, className = '' }: { titre: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`border border-filet ${className}`}>
      <h2 className="bg-bande text-white font-display uppercase tracking-wide text-lg px-4 py-2">{titre}</h2>
      <div className="p-4">{children}</div>
    </div>
  );
}
