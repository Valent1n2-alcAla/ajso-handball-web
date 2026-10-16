import type { LigneClassement } from '@/lib/types';

/** Classement d'une poule ; la ligne de l'AJSO est mise en avant. */
export default function TableClassement({ lignes, compact = false }: { lignes: LigneClassement[]; compact?: boolean }) {
  const tri = [...lignes].sort((a, b) => a.position - b.position);
  const cols = compact
    ? ([['joues', 'J'], ['points', 'Pts']] as const)
    : ([['joues', 'J'], ['gagnes', 'G'], ['nuls', 'N'], ['perdus', 'P'], ['butsPour', 'BP'], ['butsContre', 'BC']] as const);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="font-mono text-[11px] uppercase tracking-widest text-nuit/50 border-b-2 border-nuit">
            <th className="text-left py-3 pr-3 w-10">#</th>
            <th className="text-left py-3 pr-3">Équipe</th>
            {!compact && <th className="text-right py-3 px-2">Pts</th>}
            {cols.map(([, l]) => <th key={l} className="text-right py-3 px-2">{l}</th>)}
            {!compact && <th className="text-right py-3 pl-2">Diff</th>}
          </tr>
        </thead>
        <tbody>
          {tri.map((l) => (
            <tr key={l.id} className={`border-b border-nuit/10 ${l.estAjso ? 'bg-losange text-white font-semibold' : ''}`}>
              <td className="py-3 pr-3 pl-2 font-display text-lg">{l.position}</td>
              <td className="py-3 pr-3 uppercase">{l.equipe}</td>
              {!compact && <td className="py-3 px-2 text-right font-display text-lg">{l.points}</td>}
              {cols.map(([k]) => <td key={k} className={`py-3 px-2 text-right font-mono ${k === 'points' ? 'font-display text-lg' : ''}`}>{l[k]}</td>)}
              {!compact && (
                <td className="py-3 pl-2 pr-2 text-right font-mono">
                  {l.butsPour - l.butsContre > 0 ? '+' : ''}{l.butsPour - l.butsContre}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
