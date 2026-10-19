import Link from 'next/link';
import Logo from './Logo';
import { BoutonLien } from './ui';

const LIENS = [
  ['/equipes', 'Équipes'],
  ['/calendrier', 'Calendrier'],
  ['/actualites', 'Actualités'],
  ['/contact', 'Contact'],
] as const;

/** Contenu de la page 404 ; `conteneur` = 'div' quand la page est déjà dans le <main> du site. */
export default function PageIntrouvable({ conteneur: Conteneur = 'main' }: { conteneur?: 'main' | 'div' }) {
  return (
    <Conteneur className="relative flex-1 min-h-[75vh] bg-nuit text-white motif-losanges flex items-center overflow-hidden">
      <div aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] max-w-[140vw] aspect-square rotate-45 bg-losange opacity-30" />
      <div aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] max-w-[160vw] aspect-square rotate-45 border-2 border-glacier/15" />
      <span aria-hidden className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-display text-[42vw] md:text-[26rem] leading-none text-white/[0.04] select-none pointer-events-none">404</span>
      <div className="relative max-w-3xl mx-auto px-4 py-24 text-center animate-apparition">
        <Link href="/" aria-label="AJSO Handball, accueil" className="inline-block mb-8">
          <Logo size={150} decoratif className="mx-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]" />
        </Link>
        <p className="font-mono text-xs tracking-[0.35em] uppercase text-jaune mb-4">Erreur 404</p>
        <h1 className="font-display text-6xl md:text-8xl uppercase leading-[1.02]">Hors du terrain&nbsp;!</h1>
        <p className="text-white/80 text-lg mt-6 mb-10">Cette page n&apos;existe pas ou a été déplacée.</p>
        <BoutonLien href="/">Retour à l&apos;accueil</BoutonLien>
        <nav aria-label="Pages utiles" className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-widest">
          {LIENS.map(([href, label]) => (
            <Link key={href} href={href} className="text-glacier hover:text-jaune transition-colors">{label}</Link>
          ))}
        </nav>
      </div>
    </Conteneur>
  );
}
