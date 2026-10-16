import Link from 'next/link';
import { enregistrer } from '../../../actions';
import FormulaireRessource from '@/components/admin/FormulaireRessource';
import { chargerOptions, ressourceOu404, valeursInitiales } from '../commun';

export default async function NouveauPage({ params }: PageProps<'/admin/[ressource]/nouveau'>) {
  const { ressource: cle } = await params;
  const r = ressourceOu404(cle);
  const options = await chargerOptions(r);

  return (
    <>
      <Link href={`/admin/${cle}`} className="font-mono text-xs uppercase tracking-widest text-violet">← {r.titre}</Link>
      <h1 className="font-display text-4xl uppercase mt-2 mb-8">Nouveau {r.singulier}</h1>
      <div className="bg-white p-6 md:p-8 max-w-4xl">
        <FormulaireRessource champs={r.champs} valeurs={valeursInitiales(r, null)} options={options} action={enregistrer.bind(null, cle, null)} />
      </div>
    </>
  );
}
