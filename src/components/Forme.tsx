import type { Resultat } from '@/lib/stats';

const STYLE: Record<Resultat, string> = {
  V: 'bg-victoire text-white',
  N: 'bg-jaune text-nuit',
  D: 'bg-defaite text-white',
};
const TITRE: Record<Resultat, string> = { V: 'Victoire', N: 'Nul', D: 'Défaite' };

/** Pastilles des derniers résultats (le plus récent à gauche). */
export default function Forme({ forme, taille = 'md' }: { forme: Resultat[]; taille?: 'sm' | 'md' }) {
  if (!forme.length) return null;
  const t = taille === 'sm' ? 'w-5 h-5 text-[10px]' : 'w-7 h-7 text-xs';
  return (
    <span className="inline-flex gap-1" aria-label={`Forme : ${forme.map((r) => TITRE[r]).join(', ')}`}>
      {forme.map((r, i) => (
        <span key={i} title={TITRE[r]} className={`${t} ${STYLE[r]} inline-flex items-center justify-center font-mono font-semibold`}>{r}</span>
      ))}
    </span>
  );
}
