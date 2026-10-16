import type { Metadata } from 'next';
import { CarteEvenement } from '@/components/Evenement';
import { PageHero, Section, Vide } from '@/components/ui';
import { getEvenements } from '@/lib/api';

export const metadata: Metadata = { title: 'Agenda', description: "Tournois, stages, fêtes et assemblée générale de l'AJSO Handball." };

export default async function AgendaPage() {
  const [avenir, passes] = await Promise.all([getEvenements('avenir'), getEvenements('passes')]);

  return (
    <>
      <PageHero surtitre="Vie du club" titre="Agenda">Tournois, stages, moments festifs : les rendez-vous des Ratons hors championnat.</PageHero>
      <Section titre="À venir">
        {avenir.length === 0 ? <Vide>Aucun événement programmé pour le moment.</Vide> : (
          <div className="grid md:grid-cols-2 gap-6">{avenir.map((e) => <CarteEvenement key={e.id} e={e} />)}</div>
        )}
      </Section>
      {passes.length > 0 && (
        <section className="bg-papier">
          <Section titre="C'était…">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {passes.slice(0, 9).map((e) => <CarteEvenement key={e.id} e={e} passe />)}
            </div>
          </Section>
        </section>
      )}
    </>
  );
}
