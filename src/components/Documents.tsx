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
    <span aria-hidden className={`relative w-11 h-14 shrink-0 flex items-end justify-center pb-1.5 ${pdf ? 'text-defaite' : 'text-bande'}`}>
      <svg viewBox="0 0 44 56" className="absolute inset-0 w-full h-full" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M4 2h24l12 12v40H4z" fill="white" /><path d="M28 2v12h12" />
      </svg>
      <span className="relative text-[9px] font-bold">{pdf ? 'PDF' : 'IMG'}</span>
    </span>
  );
}

/** Documents téléchargeables, regroupés par catégorie. */
export default function ListeDocuments({ documents, titres = true }: { documents: DocumentClub[]; titres?: boolean }) {
  const groupes = ORDRE.map((c) => [c, documents.filter((d) => (d.categorie ?? 'autre') === c)] as const).filter(([, l]) => l.length);
  return (
    <div className="space-y-8">
      {groupes.map(([cat, liste]) => (
        <div key={cat}>
          {titres && (
            <h3 className="font-display uppercase text-xl text-nuit mb-3">{CATEGORIES_DOCUMENT[cat]}</h3>
          )}
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {liste.map((d) => {
              const pdf = estPdf(d.url);
              return (
                <li key={d.id}>
                  <a href={d.url} target="_blank" rel="noopener noreferrer"
                    className="group h-full flex items-center gap-4 border border-filet p-3 hover:border-bande">
                    <IconeDocument pdf={pdf} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold leading-snug group-hover:underline break-words">{d.titre}</span>
                      <span className="block text-[12.5px] text-encre/75 mt-0.5">{pdf ? 'PDF' : 'Image'} · Télécharger<span className="sr-only"> (nouvel onglet)</span></span>
                    </span>
                    <svg aria-hidden viewBox="0 0 24 24" className="w-5 h-5 shrink-0 text-bande" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 20h14" /></svg>
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
