import Link from 'next/link';
import { apiAdmin } from '@/lib/auth';
import { RESSOURCES } from '@/lib/admin-ressources';
import { aujourdhuiParis } from '@/lib/format';

async function total(path: string): Promise<number | null> {
  const res = await apiAdmin(`${path}${path.includes('?') ? '&' : '?'}itemsPerPage=1`);
  if (!res.ok) return null;
  const d = await res.json();
  return d.totalItems ?? d['hydra:totalItems'] ?? null;
}

export default async function TableauDeBord() {
  const auj = aujourdhuiParis();
  const [nonLus, aVenir, actus, equipes] = await Promise.all([
    total('/api/message_contacts?lu=false'),
    total(`/api/rencontres?date[after]=${auj}`),
    total('/api/actualites'),
    total('/api/equipes?estAjso=true'),
  ]);

  const tuiles = [
    { label: 'Messages non lus', valeur: nonLus, href: '/admin/messages', accent: true },
    { label: 'Matchs à venir', valeur: aVenir, href: '/admin/rencontres' },
    { label: 'Articles', valeur: actus, href: '/admin/actualites' },
    { label: 'Équipes du club', valeur: equipes, href: '/admin/equipes' },
  ];

  return (
    <>
      <h1 className="font-display text-4xl md:text-5xl uppercase mb-8">Tableau de bord</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-12">
        {tuiles.map((t) => (
          <Link key={t.label} href={t.href} className={`p-6 ${t.accent && t.valeur ? 'bg-losange text-white' : 'bg-white hover:shadow-md'}`}>
            <p className="font-mono text-[11px] uppercase tracking-widest opacity-70">{t.label}</p>
            <p className="font-display text-6xl mt-2">{t.valeur ?? '–'}</p>
          </Link>
        ))}
      </div>
      <h2 className="font-display text-2xl uppercase mb-4">Actions rapides</h2>
      <div className="flex flex-wrap gap-3">
        {[['rencontres', 'Ajouter un match'], ['actualites', 'Publier une actu'], ['creneaux', 'Ajouter un créneau']].map(([k, l]) => (
          <Link key={k} href={`/admin/${k}/nouveau`} className="bg-nuit text-white font-display uppercase tracking-wide px-5 py-3 hover:bg-roi">+ {l}</Link>
        ))}
        <Link href="/admin/rencontres" className="bg-jaune text-nuit font-display uppercase tracking-wide px-5 py-3 hover:bg-white">Saisir un score</Link>
        <Link href="/admin/ffhb" className="bg-violet text-white font-display uppercase tracking-wide px-5 py-3 hover:bg-roi">Import FFHandball</Link>
        <Link href="/admin/albums/nouveau" className="bg-nuit text-white font-display uppercase tracking-wide px-5 py-3 hover:bg-roi">+ Album photo</Link>
      </div>
      <p className="text-sm text-nuit/50 mt-10">Les modifications apparaissent immédiatement sur le site. {Object.keys(RESSOURCES).length} rubriques gérables.</p>
    </>
  );
}
