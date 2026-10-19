import Link from 'next/link';
import { libelleSaison } from '@/lib/saison';

/** Choix de la saison affichée (archives). Masqué tant qu'une seule saison existe. */
export default function SelecteurSaison({ saisons, active, lien, className = '' }: {
  saisons: string[]; active: string; lien: (saison: string) => string; className?: string;
}) {
  if (saisons.length < 2) return null;
  return (
    <nav aria-label="Saison" className={`rangee-defilante flex items-center gap-1.5 overflow-x-auto ${className}`}>
      <span className="shrink-0 font-display uppercase text-[14px] text-encre mr-1">Saison</span>
      {saisons.map((s) => (
        <Link key={s} href={lien(s)} scroll={false} aria-current={s === active ? 'page' : undefined}
          className={`shrink-0 font-display text-[15px] px-3 py-1 ${s === active ? 'bg-nuit text-white' : 'bg-bande text-white hover:bg-bande-fonce'}`}>
          {libelleSaison(s)}
        </Link>
      ))}
    </nav>
  );
}
