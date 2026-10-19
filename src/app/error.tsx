'use client';

export default function Erreur({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-24 text-center">
      <div>
        <h1 className="font-display text-5xl uppercase mb-4">Temps mort</h1>
        <p className="text-encre mb-8">Une erreur est survenue. Réessayez dans un instant.</p>
        <button onClick={retry} className="bg-nuit text-white font-display uppercase tracking-wider px-7 py-3.5 hover:bg-bande-fonce">Réessayer</button>
      </div>
    </main>
  );
}
