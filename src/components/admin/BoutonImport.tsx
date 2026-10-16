'use client';

import { useActionState } from 'react';
import { importerFfhb, type ResultatImport } from '@/app/admin/actions';

export default function BoutonImport({ equipeId }: { equipeId: string }) {
  const [etat, action, enCours] = useActionState<ResultatImport>(importerFfhb.bind(null, equipeId), {});
  return (
    <form action={action} className="space-y-1">
      <button type="submit" disabled={enCours} className="bg-violet text-white font-display uppercase tracking-wide px-4 py-2 hover:bg-roi disabled:opacity-50">
        {enCours ? 'Import… (≈ 30 s)' : 'Importer'}
      </button>
      {etat.ok && <p className="text-emerald-700 text-xs">{etat.ok}</p>}
      {etat.erreur && <p className="text-rose-600 text-xs">{etat.erreur}</p>}
    </form>
  );
}
