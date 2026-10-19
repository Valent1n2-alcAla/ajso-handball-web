import Link from 'next/link';
import { libelleSaison } from '@/lib/saison';

/** Choix de la saison affichée (archives). Masqué tant qu'une seule saison existe. */
export default function SelecteurSaison({ saisons, active, lien, className = '' }: {
  saisons: string[]; active: string; lien: (saison: string) => string; className?: string;
}) {
  if (saisons.length < 2) return null;
  return (
    <nav aria-label="Saison" className={`rangee-defilante flex items-center gap-2 overflow-x-auto ${className}`}>
      <span className="shrink-0 font-mono text-[11px] uppercase tracking-widest text-nuit/55 mr-1">Saison</span>
      {saisons.map((s) => (
        <Link key={s} href={lien(s)} scroll={false} aria-current={s === active ? 'page' : undefined}
          className={`shrink-0 font-mono text-xs font-semibold tracking-wider px-3 py-2 border-2 transition-colors ${s === active ? 'border-nuit bg-nuit text-white' : 'border-nuit/10 bg-white hover:border-violet'}`}>
          {libelleSaison(s)}
        </Link>
      ))}
    </nav>
  );
}
