import type { Metadata } from 'next';
import Link from 'next/link';
import { LigneMatch } from '@/components/Match';
import SelecteurSaison from '@/components/SelecteurSaison';
import { PageHero, Section, Vide } from '@/components/ui';
import { getDatePremierMatch, getEquipesClub, getProchainsMatchs, getResultatsSaison } from '@/lib/api';
import { libelleSaison, lireSaison, saisonCourante, saisonsDisponibles } from '@/lib/saison';
import { FUSEAU, parseDate } from '@/lib/format';
import type { Rencontre } from '@/lib/types';
import { styleCategorie } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'Calendrier & résultats',
  description: "Prochains matchs et derniers résultats de toutes les équipes de l'AJS Ouistreham Handball : dates, horaires, lieux et scores.",
};

function parMois(matchs: Rencontre[]) {
  const mois = new Map<string, Rencontre[]>();
  for (const m of matchs) {
    const cle = parseDate(m.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: FUSEAU });
    mois.set(cle, [...(mois.get(cle) ?? []), m]);
  }
  return [...mois.entries()];
}

export default async function CalendrierPage({ searchParams }: PageProps<'/calendrier'>) {
  const sp = await searchParams;
  const vue = sp.vue === 'resultats' ? 'resultats' : 'avenir';
  const equipeId = typeof sp.equipe === 'string' && /^\d+$/.test(sp.equipe) ? sp.equipe : '';
  const filtre = equipeId ? `&equipe=${equipeId}` : '';
  const courante = saisonCourante();
  const demandee = vue === 'resultats' ? lireSaison(sp.saison) : null;

  const [equipes, premierMatch] = await Promise.all([getEquipesClub(), vue === 'resultats' ? getDatePremierMatch() : null]);
  const saisons = saisonsDisponibles(courante, premierMatch);
  const saison = demandee && saisons.includes(demandee) ? demandee : courante;
  const matchs = await (vue === 'resultats' ? getResultatsSaison(saison, filtre) : getProchainsMatchs(filtre));
  const archive = vue === 'resultats' && saison !== courante;

  const lien = (v: string, e: string, s = saison) => `/calendrier?${new URLSearchParams({
    ...(v === 'resultats' ? { vue: v } : {}),
    ...(v === 'resultats' && s !== courante ? { saison: s } : {}),
    ...(e ? { equipe: e } : {}),
  })}`;

  return (
    <>
      <PageHero surtitre={archive ? `Saison ${libelleSaison(saison)}` : 'Saison en cours'} titre={<>Calendrier <span className="text-jaune">&amp;</span> résultats</>} />
      <Section>
        <div className="flex flex-col lg:flex-row lg:items-start gap-6 mb-12">
          <nav className="inline-flex shrink-0 self-start bg-papier p-1.5" aria-label="Vue">
            {[['avenir', 'À venir'], ['resultats', 'Résultats']].map(([v, l]) => (
              <Link key={v} href={lien(v, equipeId)} aria-current={vue === v ? 'page' : undefined}
                className={`font-display uppercase tracking-wide text-lg px-6 py-2.5 transition-colors ${vue === v ? 'bg-nuit text-white shadow-md' : 'text-nuit/70 hover:text-nuit'}`}>
                {l}
              </Link>
            ))}
          </nav>
          <nav className="rangee-defilante flex lg:flex-wrap gap-2 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-1" aria-label="Filtrer par équipe">
            <Link href={lien(vue, '')} aria-current={!equipeId ? 'page' : undefined} className={`shrink-0 text-sm font-semibold px-4 py-2 border-2 transition-colors ${!equipeId ? 'border-violet bg-violet text-white' : 'border-nuit/10 hover:border-violet'}`}>Toutes les équipes</Link>
            {equipes.map((e) => (
              <Link key={e.id} href={lien(vue, String(e.id))} aria-current={equipeId === String(e.id) ? 'page' : undefined} style={styleCategorie(e)}
                className={`shrink-0 inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 border-2 whitespace-nowrap transition-colors ${equipeId === String(e.id) ? 'border-violet bg-violet text-white' : 'border-nuit/10 hover:border-violet'}`}>
                <span aria-hidden className="w-2 h-2 rotate-45 bg-(--cat)" />
                {e.nom}
              </Link>
            ))}
          </nav>
        </div>
        {vue === 'resultats' && <SelecteurSaison saisons={saisons} active={saison} lien={(s) => lien('resultats', equipeId, s)} className="-mt-6 mb-12 -mx-4 px-4 md:mx-0 md:px-0 pb-1" />}

        {matchs.length === 0 ? (
          <Vide
            titre={vue === 'resultats' ? (archive ? `Aucun résultat en ${libelleSaison(saison)}` : 'Aucun résultat') : 'Aucun match programmé'}
            action={vue === 'resultats' ? { href: lien('avenir', equipeId), label: 'Voir les matchs à venir' } : { href: lien('resultats', equipeId), label: 'Voir les résultats' }}
          >
            {vue === 'resultats' ? 'Les scores seront publiés ici après chaque rencontre.' : 'Les prochaines rencontres seront annoncées ici dès leur programmation.'}
          </Vide>
        ) : (
          <div className="space-y-12">
            {parMois(matchs).map(([mois, liste]) => (
              <div key={mois}>
                <h2 className="flex items-center gap-4 font-display text-3xl md:text-4xl uppercase mb-4">
                  <span aria-hidden className="w-3 h-3 rotate-45 bg-jaune" />
                  {mois}
                  <span aria-hidden className="flex-1 h-px bg-nuit/10" />
                  <span className="font-mono text-xs tracking-widest text-nuit/60">{liste.length} match{liste.length > 1 ? 's' : ''}</span>
                </h2>
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
