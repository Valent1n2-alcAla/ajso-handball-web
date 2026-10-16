import Link from 'next/link';
import { notFound } from 'next/navigation';
import { enregistrer } from '../../../actions';
import FormulaireRessource from '@/components/admin/FormulaireRessource';
import { apiAdmin } from '@/lib/auth';
import { chargerOptions, ressourceOu404, valeursInitiales } from '../commun';

export default async function EditionPage({ params }: PageProps<'/admin/[ressource]/[id]'>) {
  const { ressource: cle, id } = await params;
  const r = ressourceOu404(cle);
  if (!/^\d+$/.test(id)) notFound();

  const [res, options] = await Promise.all([apiAdmin(`${r.endpoint}/${id}`), chargerOptions(r)]);
  if (!res.ok) notFound();
  const item = await res.json();

  return (
    <>
      <Link href={`/admin/${cle}`} className="font-mono text-xs uppercase tracking-widest text-violet">← {r.titre}</Link>
      <h1 className="font-display text-4xl uppercase mt-2 mb-8">Modifier {r.singulier}</h1>
      <div className="bg-white p-6 md:p-8 max-w-4xl">
        <FormulaireRessource champs={r.champs} valeurs={valeursInitiales(r, item)} options={options} action={enregistrer.bind(null, cle, id)} />
      </div>
    </>
  );
}
