import type { StatJoueur } from '@/lib/stats';

const virgule = (n: number) => n.toFixed(1).replace('.', ',');

/** Podium des meilleurs buteurs + tableau complet. */
export default function StatsJoueurs({ stats, matchsEquipe }: { stats: StatJoueur[]; matchsEquipe: number }) {
  const podium = stats.filter((s) => s.buts > 0).slice(0, 3);
  // Colonnes détaillées seulement si les feuilles de match les ont fournies
  const avecTirs = stats.some((s) => s.tirs > 0);
  const avecArrets = stats.some((s) => s.arrets > 0);
  const avecSanctions = stats.some((s) => s.exclusions + s.cartons > 0);
  const gardien = [...stats].filter((s) => s.arrets > 0).sort((a, b) => b.arrets - a.arrets)[0];
  return (
    <div className="space-y-6">
      {podium.length > 0 && (
        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {podium.map((s, i) => (
            <li key={s.joueur.id} className={`border border-filet border-t-4 p-4 ${i === 0 ? 'border-t-jaune' : 'border-t-bande'}`}>
              <p className="text-[13px] text-encre/75">{i === 0 ? 'Meilleur buteur' : `${i + 1}e buteur`}</p>
              <p className="font-display text-xl uppercase leading-tight text-nuit">{s.joueur.nomAffiche}</p>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-4xl leading-none text-bande">{s.buts}</span>
                <span className="text-[13px] text-encre/75">buts · {virgule(s.moyenne)} par match</span>
              </p>
            </li>
          ))}
        </ol>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-[14px] border border-filet">
          <thead>
            <tr className="font-display uppercase text-[14px] text-white bg-bande">
              <th className="text-left py-2 px-3">Joueur</th>
              <th className="text-right py-2 px-2" title="Matchs joués">MJ</th>
              <th className="text-right py-2 px-2">Buts</th>
              <th className="text-right py-2 px-2" title="Buts par match">Moy.</th>
              <th className="text-right py-2 px-2" title="Meilleur total sur un match">Record</th>
              {avecTirs && <th className="text-right py-2 px-2" title="Buts / tirs">Réussite</th>}
              {avecTirs && <th className="text-right py-2 px-2" title="Buts sur jet de 7 m">7 m</th>}
              {avecArrets && <th className="text-right py-2 px-2">Arrêts</th>}
              {avecSanctions && <th className="text-right py-2 pl-2 pr-3" title="Exclusions de 2 minutes / cartons">2&apos; / Cartons</th>}
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.joueur.id} className="border-b border-filet even:bg-papier">
                <td className="py-2 px-3">
                  {s.joueur.numero != null && <span className="font-display text-lg text-bande inline-block w-8">{s.joueur.numero}</span>}
                  <span className="uppercase font-semibold">{s.joueur.nomAffiche}</span>
                </td>
                <td className="py-2 px-2 text-right">{s.matchs}{matchsEquipe ? <span className="text-encre/60">/{matchsEquipe}</span> : null}</td>
                <td className="py-2 px-2 text-right font-display text-lg">{s.buts}</td>
                <td className="py-2 px-2 text-right">{virgule(s.moyenne)}</td>
                <td className="py-2 px-2 text-right">{s.record}</td>
                {avecTirs && <td className="py-2 px-2 text-right">{s.tirs ? `${Math.round((s.buts / s.tirs) * 100)} %` : '—'}</td>}
                {avecTirs && <td className="py-2 px-2 text-right">{s.buts7m || '—'}</td>}
                {avecArrets && <td className="py-2 px-2 text-right">{s.arrets || '—'}</td>}
                {avecSanctions && <td className="py-2 pl-2 pr-3 text-right">{s.exclusions} / {s.cartons}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {gardien && (
        <p className="text-[14px]">
          Gardien le plus décisif : <strong className="uppercase">{gardien.joueur.nomAffiche}</strong>, {gardien.arrets} arrêts en {gardien.matchs} match{gardien.matchs > 1 ? 's' : ''}.
        </p>
      )}
      <p className="text-[13px] text-encre/70">D&apos;après les feuilles de match saisies ({matchsEquipe} match{matchsEquipe > 1 ? 's' : ''}).</p>
    </div>
  );
}
