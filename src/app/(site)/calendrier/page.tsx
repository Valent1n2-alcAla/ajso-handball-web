import type { Metadata } from 'next';
import Link from 'next/link';
import { LigneMatch } from '@/components/Match';
import { PageHero, Section, Vide } from '@/components/ui';
import { getDerniersResultats, getEquipesClub, getProchainsMatchs } from '@/lib/api';
import { parseDate } from '@/lib/format';
import type { Rencontre } from '@/lib/types';

export const metadata: Metadata = { title: 'Calendrier & résultats' };

function parMois(matchs: Rencontre[]) {
  const mois = new Map<string, Rencontre[]>();
  for (const m of matchs) {
    const cle = parseDate(m.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    mois.set(cle, [...(mois.get(cle) ?? []), m]);
  }
  return [...mois.entries()];
}

export default async function CalendrierPage({ searchParams }: PageProps<'/calendrier'>) {
  const sp = await searchParams;
  const vue = sp.vue === 'resultats' ? 'resultats' : 'avenir';
  const equipeId = typeof sp.equipe === 'string' && /^\d+$/.test(sp.equipe) ? sp.equipe : '';
  const filtre = equipeId ? `&equipe=${equipeId}` : '';

  const [equipes, matchs] = await Promise.all([
    getEquipesClub(),
    vue === 'resultats' ? getDerniersResultats(filtre) : getProchainsMatchs(filtre),
  ]);

  const lien = (v: string, e: string) => `/calendrier?${new URLSearchParams({ ...(v === 'resultats' ? { vue: v } : {}), ...(e ? { equipe: e } : {}) })}`;

  return (
    <>
      <PageHero surtitre="Saison en cours" titre={<>Calendrier <span className="text-jaune">&amp;</span> résultats</>} />
      <Section>
        <div className="flex flex-wrap gap-2 mb-6" role="tablist">
          {[['avenir', 'À venir'], ['resultats', 'Résultats']].map(([v, l]) => (
            <Link key={v} href={lien(v, equipeId)} role="tab" aria-selected={vue === v}
              className={`font-display uppercase tracking-wide text-lg px-6 py-3 ${vue === v ? 'bg-nuit text-white' : 'bg-papier hover:bg-nuit/10'}`}>
              {l}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-12">
          <Link href={lien(vue, '')} className={`text-sm px-4 py-2 border ${!equipeId ? 'border-violet bg-violet text-white' : 'border-nuit/15 hover:border-violet'}`}>Toutes</Link>
          {equipes.map((e) => (
            <Link key={e.id} href={lien(vue, String(e.id))}
              className={`text-sm px-4 py-2 border ${equipeId === String(e.id) ? 'border-violet bg-violet text-white' : 'border-nuit/15 hover:border-violet'}`}>
              {e.nom}
            </Link>
          ))}
        </div>

        {matchs.length === 0 ? (
          <Vide>{vue === 'resultats' ? 'Aucun résultat pour le moment.' : 'Aucun match programmé.'}</Vide>
        ) : (
          <div className="space-y-12">
            {parMois(matchs).map(([mois, liste]) => (
              <div key={mois}>
                <h2 className="font-display text-2xl md:text-3xl uppercase text-violet mb-2">{mois}</h2>
                <div className="divide-y divide-nuit/10 border-y border-nuit/10">
                  {liste.map((r) => <LigneMatch key={r.id} r={r} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
