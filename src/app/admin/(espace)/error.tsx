'use client';

import Link from 'next/link';

export default function ErreurAdmin({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="bg-white p-8 md:p-10 max-w-2xl" role="alert">
      <h1 className="font-display text-4xl uppercase mb-3">Erreur</h1>
      <p className="text-nuit/70 mb-2">L&apos;opération n&apos;a pas pu aboutir (API injoignable ou réponse inattendue).</p>
      {error.digest && <p className="font-mono text-xs text-nuit/40 mb-6">Référence : {error.digest}</p>}
      <div className="flex flex-wrap gap-3 mt-6">
        <button type="button" onClick={retry} className="bg-violet text-white font-display uppercase tracking-wide px-5 py-3 hover:bg-roi">Réessayer</button>
        <Link href="/admin" className="border border-nuit/15 font-display uppercase tracking-wide px-5 py-3 hover:border-violet">Tableau de bord</Link>
      </div>
    </div>
  );
}
