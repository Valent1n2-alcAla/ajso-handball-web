import Link from 'next/link';
import BoutonImport from '@/components/admin/BoutonImport';
import { listeAdmin } from '@/lib/auth';
import type { Equipe } from '@/lib/types';

export const metadata = { title: 'Import FFHandball' };

export default async function FfhbPage() {
  const equipes = await listeAdmin<Equipe>('/api/equipes?estAjso=true');

  return (
    <>
      <h1 className="font-display text-4xl md:text-5xl uppercase mb-3">Import FFHandball</h1>
      <p className="text-nuit/60 max-w-3xl mb-8">
        Récupère automatiquement les matchs, horaires, salles, scores et le classement depuis ffhandball.fr.
        Pour chaque équipe : renseignez son <strong>nom exact sur ffhandball.fr</strong> (fiche équipe) et
        l&apos;<strong>adresse de la page de sa poule</strong> (fiche championnat). L&apos;import tourne aussi tout seul
        chaque jour si la tâche planifiée est installée sur le serveur.
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
              const pret = !!e.nomFfhb && !!e.championnat?.urlFfhb;
              return (
                <tr key={e.id} className="border-b border-nuit/5 align-top">
                  <td className="px-4 py-3 font-semibold">{e.nom}</td>
                  <td className="px-4 py-3">
                    {e.nomFfhb ?? <Link href={`/admin/equipes/${e.id}`} className="text-rose-600 hover:underline">À renseigner</Link>}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    {!e.championnat ? (
                      <Link href={`/admin/equipes/${e.id}`} className="text-rose-600 hover:underline">Aucun championnat</Link>
                    ) : e.championnat.urlFfhb ? (
                      <a href={e.championnat.urlFfhb} target="_blank" rel="noopener noreferrer" className="text-roi hover:underline">{e.championnat.nom} ↗</a>
                    ) : (
                      <Link href={`/admin/championnats/${e.championnat.id}`} className="text-rose-600 hover:underline">Adresse à renseigner</Link>
                    )}
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
