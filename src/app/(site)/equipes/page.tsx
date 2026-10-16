import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, Section, Vide } from '@/components/ui';
import { getEquipesClub } from '@/lib/api';
import type { Equipe } from '@/lib/types';

export const metadata: Metadata = { title: 'Équipes', description: "Toutes les équipes de l'AJSO Handball, de l'école de hand aux seniors." };

export default async function EquipesPage() {
  const equipes = await getEquipesClub();

  // Regroupement par tranche d'âge, dans l'ordre d'apparition
  const groupes = new Map<string, Equipe[]>();
  for (const e of equipes) {
    const cle = e.categorie?.tranche?.nom ?? 'Autres';
    groupes.set(cle, [...(groupes.get(cle) ?? []), e]);
  }
  const ordre = ['Adultes', 'Jeunes', 'École de hand'];
  const rang = (t: string) => (ordre.includes(t) ? ordre.indexOf(t) : ordre.length);
  const tri = [...groupes.entries()].sort(([a], [b]) => rang(a) - rang(b));

  return (
    <>
      <PageHero surtitre="Saison en cours" titre={<>Nos <span className="text-degrade">équipes</span></>}>
        {equipes.length} équipes engagées, du Baby Hand aux Seniors.
      </PageHero>
      <Section>
        {equipes.length === 0 && <Vide>Les équipes seront affichées ici.</Vide>}
        <div className="space-y-16">
          {tri.map(([tranche, liste]) => (
            <div key={tranche}>
              <h2 className="font-display text-3xl md:text-4xl uppercase mb-6 flex items-center gap-4">
                <span className="w-4 h-4 rotate-45 bg-losange inline-block" />
                {tranche}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {liste.map((e) => (
                  <Link key={e.id} href={`/equipes/${e.id}`} className="group bg-papier hover:bg-nuit transition-colors p-7 flex flex-col min-h-[190px] relative overflow-hidden">
                    <span aria-hidden className="absolute -right-12 -top-12 w-32 h-32 rotate-45 bg-losange opacity-10 group-hover:opacity-80 transition-opacity" />
                    <p className="font-mono text-[11px] uppercase tracking-widest text-violet group-hover:text-glacier">{e.categorie?.nom}</p>
                    <p className="font-display text-3xl uppercase mt-2 group-hover:text-white">{e.nom}</p>
                    <p className="mt-auto pt-4 text-sm text-nuit/60 group-hover:text-white/60">
                      {e.championnat ? e.championnat.nom : 'Pratique sans championnat'}
                    </p>
                    <span className="text-sm font-display uppercase tracking-wide text-roi group-hover:text-jaune mt-2">Voir l&apos;équipe →</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
