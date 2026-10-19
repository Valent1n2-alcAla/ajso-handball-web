import type { Metadata } from 'next';
import { CarteEvenement } from '@/components/Evenement';
import { Section, TitrePage, Vide } from '@/components/ui';
import { getEvenements } from '@/lib/api';

export const metadata: Metadata = { title: 'Agenda', description: "Tournois, stages, fêtes et assemblée générale de l'AJSO Handball." };

export default async function AgendaPage() {
  const [avenir, passes] = await Promise.all([getEvenements('avenir'), getEvenements('passes')]);

  return (
    <>
      <TitrePage titre="Agenda">Tournois, stages, moments festifs : les rendez-vous des Ratons hors championnat.</TitrePage>
      <Section titre="À venir">
        {avenir.length === 0 ? <Vide>Aucun événement programmé pour le moment.</Vide> : (
          <div className="border-t border-filet">{avenir.map((e) => <CarteEvenement key={e.id} e={e} />)}</div>
        )}
      </Section>
      {passes.length > 0 && (
        <Section titre="C'était…">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 border-t border-filet">
            {passes.slice(0, 10).map((e) => <CarteEvenement key={e.id} e={e} passe />)}
          </div>
        </Section>
      )}
    </>
  );
}
