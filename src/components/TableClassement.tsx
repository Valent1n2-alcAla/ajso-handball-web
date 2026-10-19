import type { LigneClassement } from '@/lib/types';

/** Classement d'une poule ; la ligne de l'AJSO est mise en avant. */
export default function TableClassement({ lignes, compact = false, legende }: { lignes: LigneClassement[]; compact?: boolean; legende?: string }) {
  const tri = [...lignes].sort((a, b) => a.position - b.position);
  // BP / BC masqués sur petit écran pour éviter le défilement horizontal
  const cols = compact
    ? ([['joues', 'J', 'Joués', '']] as const)
    : ([
        ['joues', 'J', 'Joués', ''],
        ['gagnes', 'G', 'Gagnés', ''],
        ['nuls', 'N', 'Nuls', ''],
        ['perdus', 'P', 'Perdus', ''],
        ['butsPour', 'BP', 'Buts pour', 'hidden sm:table-cell'],
        ['butsContre', 'BC', 'Buts contre', 'hidden sm:table-cell'],
      ] as const);

  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <table className="w-full text-[14px] border border-filet">
        {legende && <caption className="sr-only">{legende}</caption>}
        <thead>
          <tr className="font-display uppercase text-[14px] text-white bg-bande">
            <th scope="col" className="text-center py-3 px-2 w-10 font-semibold"><abbr title="Position" className="no-underline">#</abbr></th>
            <th scope="col" className="text-left py-3 px-2 font-semibold">Équipe</th>
            <th scope="col" className="text-right py-3 px-2 font-semibold"><abbr title="Points" className="no-underline">Pts</abbr></th>
            {cols.map(([, l, t, c]) => <th key={l} scope="col" className={`text-right py-3 px-2 font-semibold ${c}`}><abbr title={t} className="no-underline">{l}</abbr></th>)}
            {!compact && <th scope="col" className="text-right py-3 px-2 pr-3 font-semibold"><abbr title="Différence de buts" className="no-underline">Diff</abbr></th>}
          </tr>
        </thead>
        <tbody>
          {tri.map((l, i) => {
            const diff = l.butsPour - l.butsContre;
            const cellule = 'py-2 px-2 border-b border-filet';
            return (
              <tr
                key={l.id}
                aria-current={l.estAjso ? 'true' : undefined}
                className={l.estAjso ? 'bg-bande-clair font-semibold text-nuit' : i % 2 ? 'bg-papier' : 'bg-white'}
              >
                <td className={`${cellule} text-center`}>
                  <span className={`inline-flex items-center justify-center w-7 h-7 font-display text-base ${l.estAjso ? 'bg-bande text-white' : ''}`}>{l.position}</span>
                </td>
                <td className={`${cellule} uppercase ${l.estAjso ? 'font-bold' : ''} min-w-[9rem]`}>{l.equipe}</td>
                <td className={`${cellule} text-right font-display text-lg`}>{l.points}</td>
                {cols.map(([k, , , c]) => <td key={k} className={`${cellule} text-right tabular-nums ${c}`}>{l[k]}</td>)}
                {!compact && (
                  <td className={`${cellule} pr-3 text-right tabular-nums ${diff > 0 ? 'text-victoire' : diff < 0 ? 'text-defaite' : ''}`}>
                    {diff > 0 ? '+' : ''}{diff}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
