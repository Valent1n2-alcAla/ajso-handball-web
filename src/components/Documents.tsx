import type { CategorieDocument, DocumentClub } from '@/lib/types';

export const CATEGORIES_DOCUMENT: Record<CategorieDocument, string> = {
  inscription: 'Inscription',
  reglement: 'Règlements',
  assemblee: 'Assemblée générale',
  autre: 'Autres documents',
};

const ORDRE: CategorieDocument[] = ['inscription', 'reglement', 'assemblee', 'autre'];

const estPdf = (url: string) => /\.pdf($|[?#])/i.test(url);

function IconeDocument({ pdf }: { pdf: boolean }) {
  return (
    <span aria-hidden className={`relative w-11 h-14 shrink-0 flex items-end justify-center pb-1.5 ${pdf ? 'text-defaite' : 'text-roi'}`}>
      <svg viewBox="0 0 44 56" className="absolute inset-0 w-full h-full" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M4 2h24l12 12v40H4z" fill="white" /><path d="M28 2v12h12" />
      </svg>
      <span className="relative font-mono text-[9px] font-bold tracking-wider">{pdf ? 'PDF' : 'IMG'}</span>
    </span>
  );
}

/** Documents téléchargeables, regroupés par catégorie. */
export default function ListeDocuments({ documents, titres = true }: { documents: DocumentClub[]; titres?: boolean }) {
  const groupes = ORDRE.map((c) => [c, documents.filter((d) => (d.categorie ?? 'autre') === c)] as const).filter(([, l]) => l.length);
  return (
    <div className="space-y-10">
      {groupes.map(([cat, liste]) => (
        <div key={cat}>
          {titres && (
            <h3 className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-violet mb-4">
              <span aria-hidden className="w-2 h-2 rotate-45 bg-jaune" />{CATEGORIES_DOCUMENT[cat]}
            </h3>
          )}
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {liste.map((d) => {
              const pdf = estPdf(d.url);
              return (
                <li key={d.id}>
                  <a href={d.url} target="_blank" rel="noopener noreferrer"
                    className="group h-full flex items-center gap-4 bg-white ring-1 ring-nuit/10 p-4 transition hover:ring-violet hover:-translate-y-0.5 hover:shadow-md">
                    <IconeDocument pdf={pdf} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold leading-snug group-hover:text-violet break-words">{d.titre}</span>
                      <span className="block font-mono text-[11px] uppercase tracking-widest text-nuit/55 mt-1">{pdf ? 'PDF' : 'Image'} · Télécharger<span className="sr-only"> (nouvel onglet)</span></span>
                    </span>
                    <svg aria-hidden viewBox="0 0 24 24" className="w-5 h-5 shrink-0 text-nuit/40 group-hover:text-violet" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 20h14" /></svg>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
