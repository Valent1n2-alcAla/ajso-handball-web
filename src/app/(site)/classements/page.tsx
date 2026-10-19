import type { Metadata } from 'next';
import Link from 'next/link';
import TableClassement from '@/components/TableClassement';
import { PageHero, Section, Surtitre, Vide } from '@/components/ui';
import { getClassements, getEquipesClub } from '@/lib/api';
import { competitionsEquipe } from '@/lib/format';
import type { LigneClassement } from '@/lib/types';

export const metadata: Metadata = { title: 'Classements', description: "Classements des équipes de l'AJSO Handball dans leurs championnats." };

export default async function ClassementsPage() {
  const [lignes, equipes] = await Promise.all([getClassements(), getEquipesClub()]);

  const parChampionnat = new Map<number, LigneClassement[]>();
  for (const l of lignes) parChampionnat.set(l.championnat.id, [...(parChampionnat.get(l.championnat.id) ?? []), l]);

  return (
    <>
      <PageHero surtitre="Saison en cours" titre="Classements">
        Mis à jour automatiquement depuis le site de la Fédération Française de Handball.
      </PageHero>
      <Section>
        {parChampionnat.size === 0 && (
          <Vide titre="Classements bientôt disponibles" action={{ href: '/calendrier', label: 'Voir le calendrier' }}>
            Les classements apparaîtront après les premières journées de championnat.
          </Vide>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16">
          {[...parChampionnat.entries()].map(([id, liste]) => {
            const champ = liste[0].championnat;
            const nos = equipes.filter((e) => competitionsEquipe(e).some((c) => c.id === id));
            return (
              <div key={id} className="min-w-0">
                <Surtitre className="text-violet mb-3">{champ.niveau || 'Championnat'}</Surtitre>
                <h2 className="font-display text-3xl md:text-4xl uppercase leading-[1.02]">{champ.nom}</h2>
                <p className="flex flex-wrap gap-2 mt-3 mb-6">
                  {nos.map((e) => (
                    <Link key={e.id} href={`/equipes/${e.id}`} className="inline-flex items-center gap-1.5 bg-papier hover:bg-roi hover:text-white transition-colors px-3 py-1 text-sm font-semibold text-roi">
                      {e.nom} <span aria-hidden>→</span>
                    </Link>
                  ))}
                </p>
                <TableClassement lignes={liste} legende={`Classement ${champ.nom}`} />
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}
