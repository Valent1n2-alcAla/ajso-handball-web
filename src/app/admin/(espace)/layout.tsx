import type { Metadata } from 'next';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { deconnexion } from '../actions';
import { exigerToken } from '@/lib/auth';
import { MENU_ADMIN, RESSOURCES } from '@/lib/admin-ressources';

export const metadata: Metadata = { title: { default: 'Administration', template: '%s · Admin AJSO' }, robots: { index: false } };

export default async function AdminLayout({ children }: LayoutProps<'/admin'>) {
  await exigerToken();

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-papier">
      <aside className="md:w-64 md:min-h-screen bg-nuit text-white shrink-0 md:sticky md:top-0 md:self-start">
        <Link href="/admin" className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <Logo size={44} />
          <span className="font-display text-xl uppercase leading-none">Admin<br /><span className="text-glacier text-sm">AJSO</span></span>
        </Link>
        <nav className="px-3 py-4 flex md:block gap-1 overflow-x-auto text-sm" aria-label="Administration">
          <Link href="/admin/messages" className="block px-3 py-2 hover:bg-white/10 whitespace-nowrap">Messages</Link>
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
