import Link from 'next/link';
import BoutonImport from '@/components/admin/BoutonImport';
import { listeAdmin } from '@/lib/auth';
import { competitionsEquipe, nomCompetition } from '@/lib/format';
import type { Equipe } from '@/lib/types';

export const metadata = { title: 'Import FFHandball' };

export default async function FfhbPage() {
  const equipes = await listeAdmin<Equipe>('/api/equipes?estAjso=true');

  return (
    <>
      <h1 className="font-display text-4xl md:text-5xl uppercase mb-3">Import FFHandball</h1>
      <p className="text-nuit/60 max-w-3xl mb-8">
        Récupère automatiquement les matchs, horaires, salles, scores et classements depuis ffhandball.fr, pour
        toutes les compétitions de chaque équipe (championnat, phases, coupe). Il faut le <strong>nom exact de
        l&apos;équipe sur ffhandball.fr</strong> (fiche équipe) et l&apos;<strong>adresse de chaque compétition</strong>
        (fiche championnat) : page de la poule, ou page de la compétition si la poule n&apos;est pas connue (elle est
        alors trouvée au premier import). L&apos;import tourne aussi tout seul si la tâche planifiée est installée.
      </p>
      <div className="bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-nuit/10 text-left font-mono text-[11px] uppercase tracking-widest text-nuit/50">
              <th className="px-4 py-3">Équipe</th><th className="px-4 py-3">Nom FFHB</th><th className="px-4 py-3">Poule</th><th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {equipes.map((e) => {
              const competitions = competitionsEquipe(e);
              const pret = !!e.nomFfhb && competitions.some((c) => c.urlFfhb);
              return (
                <tr key={e.id} className="border-b border-nuit/5 align-top">
                  <td className="px-4 py-3 font-semibold">{e.nom}</td>
                  <td className="px-4 py-3">
                    {e.nomFfhb ?? <Link href={`/admin/equipes/${e.id}`} className="text-rose-600 hover:underline">À renseigner</Link>}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    {competitions.length === 0 && <Link href={`/admin/equipes/${e.id}`} className="text-rose-600 hover:underline">Aucune compétition</Link>}
                    <ul className="space-y-1">
                      {competitions.map((c) => (
                        <li key={c.id}>
                          {c.urlFfhb ? (
                            <a href={c.urlFfhb} target="_blank" rel="noopener noreferrer" className="text-roi hover:underline">
                              {nomCompetition(c)} ↗{!/\/poule-\d+/.test(c.urlFfhb) && <span className="text-nuit/40"> (poule cherchée à l&apos;import)</span>}
                            </a>
                          ) : (
                            <Link href={`/admin/championnats/${c.id}`} className="text-rose-600 hover:underline">{nomCompetition(c)} : adresse à renseigner</Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 text-right min-w-56">{pret ? <BoutonImport equipeId={String(e.id)} /> : <span className="text-nuit/30">—</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
