import Logo from '@/components/Logo';
import { BoutonLien } from '@/components/ui';

export default function NotFound() {
  return (
    <main className="flex-1 bg-nuit text-white motif-losanges flex items-center">
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <Logo size={160} className="mx-auto mb-8" />
        <p className="font-mono text-xs tracking-[0.35em] uppercase text-jaune mb-4">Erreur 404</p>
        <h1 className="font-display text-5xl md:text-7xl uppercase leading-none">Hors du terrain !</h1>
        <p className="text-white/70 mt-6 mb-10">Cette page n&apos;existe pas ou a été déplacée.</p>
        <BoutonLien href="/">Retour à l&apos;accueil</BoutonLien>
      </div>
    </main>
  );
}
