import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getToken, retourAdmin } from '@/lib/auth';
import Logo from '@/components/Logo';
import FormulaireConnexion from './FormulaireConnexion';

export const metadata: Metadata = { title: 'Connexion', robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<'/admin/login'>) {
  const { expire, next } = await searchParams;
  const retour = retourAdmin(next);
  // Déjà connecté : directement vers l'admin
  if (await getToken()) redirect(retour);
  return (
    <main className="flex-1 bg-nuit motif-losanges flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white p-8 md:p-10 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Logo size={64} />
          <div>
            <p className="font-display text-3xl uppercase leading-none">Espace club</p>
            <p className="font-mono text-[11px] uppercase tracking-widest text-violet mt-1">Administration AJSO</p>
          </div>
        </div>
        {expire && <p className="bg-jaune/30 px-4 py-2 mb-5 text-sm">Session expirée, reconnectez-vous.</p>}
        <FormulaireConnexion retour={retour} />
      </div>
    </main>
  );
}
