import type { Metadata } from 'next';
import Link from 'next/link';
import TableClassement from '@/components/TableClassement';
import { Chevron, Section, TitrePage, Vide } from '@/components/ui';
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
      <TitrePage titre="Classements">
        Mis à jour automatiquement depuis le site de la Fédération Française de Handball.
      </TitrePage>
      <Section>
        {parChampionnat.size === 0 && (
          <Vide titre="Classements bientôt disponibles" action={{ href: '/calendrier', label: 'Voir le calendrier' }}>
            Les classements apparaîtront après les premières journées de championnat.
          </Vide>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-10">
          {[...parChampionnat.entries()].map(([id, liste]) => {
            const champ = liste[0].championnat;
            const nos = equipes.filter((e) => competitionsEquipe(e).some((c) => c.id === id));
            return (
              <div key={id} className="min-w-0">
                <h2 className="font-display text-xl md:text-2xl uppercase leading-tight text-bande border-b-2 border-bande pb-1">{champ.nom}</h2>
                <p className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 mb-3 text-[14px]">
                  {champ.niveau && <span className="text-encre/80">{champ.niveau}</span>}
                  {nos.map((e) => (
                    <Link key={e.id} href={`/equipes/${e.id}#classement`} className="inline-flex items-center gap-1.5 font-semibold text-bande-fonce hover:underline">
                      {e.nom}<Chevron className="w-1.5 h-2.5" />
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
