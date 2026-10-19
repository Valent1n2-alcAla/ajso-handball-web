import type { Metadata } from 'next';
import Link from 'next/link';
import { unstable_rethrow } from 'next/navigation';
import Logo from '@/components/Logo';
import { deconnexion } from '../actions';
import { apiAdmin, exigerToken } from '@/lib/auth';
import { MENU_ADMIN, RESSOURCES } from '@/lib/admin-ressources';

export const metadata: Metadata = { title: { default: 'Administration', template: '%s · Admin AJSO' }, robots: { index: false } };

/** Nombre d'éléments d'une collection (0 si l'API ne répond pas). */
async function compter(path: string): Promise<number> {
  try {
    const res = await apiAdmin(`${path}&itemsPerPage=1`);
    if (!res.ok) return 0;
    const d = await res.json().catch(() => null);
    return Number(d?.totalItems ?? d?.['hydra:totalItems'] ?? 0);
  } catch (e) {
    unstable_rethrow(e); // redirection vers la connexion si le jeton est refusé
    return 0; // API injoignable : pas de pastille, la page affichera l'erreur
  }
}

function Pastille({ n, label }: { n: number; label: string }) {
  if (!n) return null;
  return <span className="ml-2 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-jaune px-1.5 font-mono text-[11px] font-bold text-nuit" aria-label={`${n} ${label}`}>{n}</span>;
}

export default async function AdminLayout({ children }: LayoutProps<'/admin'>) {
  await exigerToken();
  const [messages, preinscriptions] = await Promise.all([
    compter('/api/message_contacts?lu=false'),
    compter('/api/preinscriptions?traitee=false'),
  ]);

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-papier">
      <aside className="md:w-64 md:min-h-screen bg-nuit text-white shrink-0 md:sticky md:top-0 md:self-start">
        <Link href="/admin" className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <Logo size={44} />
          <span className="font-display text-xl uppercase leading-none">Admin<br /><span className="text-glacier text-sm">AJSO</span></span>
        </Link>
        <nav className="px-3 py-4 flex md:block gap-1 overflow-x-auto text-sm" aria-label="Administration">
          <Link href="/admin/messages" className="block px-3 py-2 hover:bg-white/10 whitespace-nowrap">Messages<Pastille n={messages} label="non lu(s)" /></Link>
          <Link href="/admin/preinscriptions" className="block px-3 py-2 hover:bg-white/10 whitespace-nowrap">Préinscriptions<Pastille n={preinscriptions} label="à traiter" /></Link>
          <Link href="/admin/ffhb" className="block px-3 py-2 hover:bg-white/10 whitespace-nowrap">Import FFHandball</Link>
          {MENU_ADMIN.map((g) => (
            <div key={g.titre} className="md:mt-4 flex md:block gap-1">
              <p className="hidden md:block px-3 pb-1 font-mono text-[10px] uppercase tracking-widest text-white/40">{g.titre}</p>
              {g.cles.map((k) => (
                <Link key={k} href={`/admin/${k}`} className="block px-3 py-2 hover:bg-white/10 whitespace-nowrap">{RESSOURCES[k].titre}</Link>
              ))}
            </div>
          ))}
          <div className="md:mt-6 md:pt-4 md:border-t border-white/10 flex md:block gap-1">
            <Link href="/" className="block px-3 py-2 text-glacier hover:bg-white/10 whitespace-nowrap">← Voir le site</Link>
            <form action={deconnexion}>
              <button type="submit" className="w-full text-left px-3 py-2 text-white/60 hover:bg-white/10 whitespace-nowrap">Déconnexion</button>
            </form>
          </div>
        </nav>
      </aside>
      <div className="flex-1 min-w-0 p-4 md:p-10">{children}</div>
    </div>
  );
}
