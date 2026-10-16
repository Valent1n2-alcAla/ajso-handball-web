'use client';

export default function Erreur({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-24 text-center">
      <div>
        <h1 className="font-display text-5xl uppercase mb-4">Temps mort</h1>
        <p className="text-nuit/60 mb-8">Une erreur est survenue. Réessayez dans un instant.</p>
        <button onClick={reset} className="bg-nuit text-white font-display uppercase tracking-wider px-7 py-3.5 hover:bg-roi">Réessayer</button>
      </div>
    </main>
  );
}
