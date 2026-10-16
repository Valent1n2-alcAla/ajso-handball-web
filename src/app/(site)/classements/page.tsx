import type { Metadata } from 'next';
import Link from 'next/link';
import TableClassement from '@/components/TableClassement';
import { PageHero, Section, Vide } from '@/components/ui';
import { getClassements, getEquipesClub } from '@/lib/api';
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
        {parChampionnat.size === 0 && <Vide>Les classements apparaîtront après les premières journées.</Vide>}
        <div className="grid lg:grid-cols-2 gap-12">
          {[...parChampionnat.entries()].map(([id, liste]) => {
            const champ = liste[0].championnat;
            const nos = equipes.filter((e) => e.championnat?.id === id);
            return (
              <div key={id}>
                <p className="font-mono text-[11px] uppercase tracking-widest text-violet">{champ.niveau}</p>
                <h2 className="font-display text-3xl uppercase mb-1">{champ.nom}</h2>
                <p className="text-sm text-nuit/50 mb-5">
                  {nos.map((e, i) => (
                    <span key={e.id}>{i > 0 && ' · '}<Link href={`/equipes/${e.id}`} className="text-roi hover:underline">{e.nom}</Link></span>
                  ))}
                </p>
                <TableClassement lignes={liste} />
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}
