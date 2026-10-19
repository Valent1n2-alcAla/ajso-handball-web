'use client';

import './globals.css';

/** Erreur dans le layout racine : remplace tout le document. */
export default function ErreurGlobale({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex items-center justify-center px-4 text-center bg-white text-nuit">
        <title>Erreur · AJSO Handball</title>
        <main>
          <h1 className="text-5xl font-bold uppercase mb-4">Temps mort</h1>
          <p className="opacity-60 mb-8">Le site rencontre un problème. Réessayez dans un instant.</p>
          <button type="button" onClick={retry} className="bg-nuit text-white uppercase tracking-wider px-7 py-3.5">Réessayer</button>
        </main>
      </body>
    </html>
  );
}
