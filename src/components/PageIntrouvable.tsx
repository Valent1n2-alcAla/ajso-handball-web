import Link from 'next/link';
import Logo from './Logo';
import { BoutonLien, CONTENEUR } from './ui';

const LIENS = [
  ['/equipes', 'Équipes'],
  ['/calendrier', 'Calendrier'],
  ['/actualites', 'Actualités'],
  ['/contact', 'Contact'],
] as const;

/** Contenu de la page 404 ; `conteneur` = 'div' quand la page est déjà dans le <main> du site. */
export default function PageIntrouvable({ conteneur: Conteneur = 'main' }: { conteneur?: 'main' | 'div' }) {
  return (
    <Conteneur className={`${CONTENEUR} flex-1 w-full py-12 md:py-16 grid gap-8 md:grid-cols-[auto_1fr] md:items-center`}>
      <Link href="/" aria-label="AJSO Handball, accueil" className="justify-self-start">
        <Logo size={150} decoratif />
      </Link>
      <div>
        <p className="font-display uppercase text-bande text-xl">Erreur 404</p>
        <h1 className="font-display text-[2rem] md:text-[2.4rem] uppercase leading-tight text-nuit">Page introuvable</h1>
        <p className="text-[15px] mt-2 mb-6">Cette page n&apos;existe pas ou a été déplacée.</p>
        <BoutonLien href="/">Retour à l&apos;accueil</BoutonLien>
        <nav aria-label="Pages utiles" className="mt-6">
          <ul className="liste-chevrons flex flex-wrap gap-x-6 gap-y-1 text-[15px]">
            {LIENS.map(([href, label]) => (
              <li key={href}><Link href={href} className="text-bande-fonce hover:underline">{label}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
    </Conteneur>
  );
}
