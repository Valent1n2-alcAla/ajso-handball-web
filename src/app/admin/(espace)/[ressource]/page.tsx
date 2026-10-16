import Link from 'next/link';
import { supprimer } from '../../actions';
import BoutonConfirmer from '@/components/admin/BoutonConfirmer';
import { listeAdmin } from '@/lib/auth';
import { formatDateCourte, JOURS } from '@/lib/format';
import type { Colonne } from '@/lib/admin-ressources';
import { ressourceOu404 } from './commun';

type Item = Record<string, unknown> & { id: number };

function lire(item: Item, chemin: string): unknown {
  return chemin.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), item);
}

function cellule(item: Item, c: Colonne) {
  const v = lire(item, c.chemin);
  if (c.type === 'bool') return v ? '✓' : '—';
  if (c.type === 'jour') return JOURS[Number(v)] ?? '';
  if (c.type === 'date') return v ? formatDateCourte(String(v)) + ' ' + String(v).slice(0, 4) : '';
  if (c.type === 'score') return item.scoreDom == null ? <span className="text-nuit/40">à jouer</span> : `${item.scoreDom} – ${item.scoreExt}`;
  return v == null ? '' : String(v);
}

export default async function ListePage({ params, searchParams }: PageProps<'/admin/[ressource]'>) {
  const { ressource: cle } = await params;
  const sp = await searchParams;
  const r = ressourceOu404(cle);
  // Filtres autorisés passés dans l'URL (ex. ?equipe=12)
  const filtres = (r.filtres ?? []).filter((f) => typeof sp[f] === 'string' && /^\d+$/.test(sp[f] as string));
  const query = filtres.length ? `?${filtres.map((f) => `${f}=${sp[f]}`).join('&')}` : '';
  const [items, equipesFiltre] = await Promise.all([
    listeAdmin<Item>(`${r.lecture ?? r.endpoint}${query}`),
    r.filtres?.includes('equipe') ? listeAdmin<Item & { nom: string }>('/api/equipes?estAjso=true') : Promise.resolve([]),
  ]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-4xl md:text-5xl uppercase">{r.titre}</h1>
        {!(r.unique && items.length > 0) && (
          <Link href={`/admin/${cle}/nouveau${query}`} className="bg-violet text-white font-display uppercase tracking-wide px-5 py-3 hover:bg-roi">
            + Ajouter
          </Link>
        )}
      </div>
      {equipesFiltre.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5 text-sm">
          <Link href={`/admin/${cle}`} className={`px-3 py-1.5 border ${!sp.equipe ? 'bg-violet text-white border-violet' : 'bg-white border-nuit/15'}`}>Toutes</Link>
          {equipesFiltre.map((e) => (
            <Link key={e.id} href={`/admin/${cle}?equipe=${e.id}`}
              className={`px-3 py-1.5 border ${sp.equipe === String(e.id) ? 'bg-violet text-white border-violet' : 'bg-white border-nuit/15 hover:border-violet'}`}>
              {e.nom}
            </Link>
          ))}
        </div>
      )}
      {sp.ok && <p className="bg-emerald-100 text-emerald-800 px-4 py-2.5 mb-4">Enregistré ✓</p>}
      {sp.supprime && <p className="bg-emerald-100 text-emerald-800 px-4 py-2.5 mb-4">Supprimé ✓</p>}
      {sp.erreur && <p className="bg-rose-100 text-rose-800 px-4 py-2.5 mb-4">Suppression impossible : cet élément est encore utilisé ailleurs (ex. une catégorie ou un gymnase rattaché à des équipes ou créneaux).</p>}

      <div className="bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-nuit/10 text-left font-mono text-[11px] uppercase tracking-widest text-nuit/50">
              {r.colonnes.map((c) => <th key={c.chemin} className="px-4 py-3 font-medium">{c.label}</th>)}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={r.colonnes.length + 1} className="px-4 py-10 text-center text-nuit/40">Aucun élément.</td></tr>
            )}
            {items.map((item) => (
              <tr key={item.id} className="border-b border-nuit/5 hover:bg-papier">
                {r.colonnes.map((c, i) => (
                  <td key={c.chemin} className="px-4 py-3">
                    {i === 0 ? <Link href={`/admin/${cle}/${item.id}`} className="font-semibold hover:text-violet">{cellule(item, c) || '(sans titre)'}</Link> : cellule(item, c)}
                  </td>
                ))}
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Link href={`/admin/${cle}/${item.id}`} className="text-roi hover:underline mr-4">Modifier</Link>
                  {!r.unique && (
                    <form action={supprimer.bind(null, cle, String(item.id))} className="inline">
                      <BoutonConfirmer message={`Supprimer cet élément (${r.singulier}) ?${r.suppression ? `\n\n${r.suppression}` : ''}`} className="text-rose-600 hover:underline">Supprimer</BoutonConfirmer>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
