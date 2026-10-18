import type { StatJoueur } from '@/lib/stats';

const virgule = (n: number) => n.toFixed(1).replace('.', ',');

/** Podium des meilleurs buteurs + tableau complet. */
export default function StatsJoueurs({ stats, matchsEquipe }: { stats: StatJoueur[]; matchsEquipe: number }) {
  const podium = stats.filter((s) => s.buts > 0).slice(0, 3);
  return (
    <div className="space-y-10">
      {podium.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-4">
          {podium.map((s, i) => (
            <div key={s.joueur.id} className={`relative overflow-hidden p-6 ${i === 0 ? 'bg-losange text-white' : 'bg-nuit text-white'}`}>
              <span aria-hidden className="absolute -right-3 -top-6 font-display text-[7rem] leading-none text-white/10">{i + 1}</span>
              <p className="font-mono text-[11px] uppercase tracking-widest text-jaune">{i === 0 ? 'Meilleur buteur' : `${i + 1}e buteur`}</p>
              <p className="font-display text-2xl uppercase mt-2 leading-tight">{s.joueur.nomAffiche}</p>
              <p className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-6xl leading-none">{s.buts}</span>
                <span className="font-mono text-xs text-white/60">buts · {virgule(s.moyenne)}/match</span>
              </p>
            </div>
          ))}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="font-mono text-[11px] uppercase tracking-widest text-nuit/50 border-b-2 border-nuit">
              <th className="text-left py-3 pr-3">Joueur</th>
              <th className="text-right py-3 px-2" title="Matchs joués">MJ</th>
              <th className="text-right py-3 px-2">Buts</th>
              <th className="text-right py-3 px-2" title="Buts par match">Moy.</th>
              <th className="text-right py-3 pl-2" title="Meilleur total sur un match">Record</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.joueur.id} className="border-b border-nuit/10">
                <td className="py-3 pr-3">
                  {s.joueur.numero != null && <span className="font-display text-lg text-violet inline-block w-9">{s.joueur.numero}</span>}
                  <span className="uppercase font-semibold">{s.joueur.nomAffiche}</span>
                </td>
                <td className="py-3 px-2 text-right font-mono">{s.matchs}{matchsEquipe ? <span className="text-nuit/30">/{matchsEquipe}</span> : null}</td>
                <td className="py-3 px-2 text-right font-display text-xl">{s.buts}</td>
                <td className="py-3 px-2 text-right font-mono">{virgule(s.moyenne)}</td>
                <td className="py-3 pl-2 text-right font-mono">{s.record}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-nuit/40">D&apos;après les feuilles de match saisies ({matchsEquipe} match{matchsEquipe > 1 ? 's' : ''}).</p>
    </div>
  );
}
