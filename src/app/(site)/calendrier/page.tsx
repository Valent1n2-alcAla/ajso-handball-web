import type { Metadata } from 'next';
import Link from 'next/link';
import { LigneMatch } from '@/components/Match';
import SelecteurSaison from '@/components/SelecteurSaison';
import { CONTENEUR, TitrePage, Vide } from '@/components/ui';
import { getDatePremierMatch, getEquipesClub, getProchainsMatchs, getResultatsSaison } from '@/lib/api';
import { libelleSaison, lireSaison, saisonCourante, saisonsDisponibles } from '@/lib/saison';
import { FUSEAU, parseDate } from '@/lib/format';
import type { Rencontre } from '@/lib/types';

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
      <TitrePage titre="Calendrier et résultats">{archive ? `Saison ${libelleSaison(saison)}` : null}</TitrePage>
      <div className={`${CONTENEUR} pt-5`}>
        <div className="bg-bande p-2.5 flex flex-wrap items-center gap-2.5">
          <nav className="flex shrink-0" aria-label="Vue">
            {[['avenir', 'À venir'], ['resultats', 'Résultats']].map(([v, l]) => (
              <Link key={v} href={lien(v, equipeId)} aria-current={vue === v ? 'page' : undefined}
                className={`font-display uppercase text-[15px] px-4 py-1.5 ${vue === v ? 'bg-nuit text-white' : 'bg-white text-nuit hover:bg-bande-clair'}`}>
                {l}
              </Link>
            ))}
          </nav>
          <form action="/calendrier" className="flex items-center gap-2">
            {vue === 'resultats' && <input type="hidden" name="vue" value="resultats" />}
            {vue === 'resultats' && saison !== courante && <input type="hidden" name="saison" value={saison} />}
            <label htmlFor="filtre-equipe" className="font-display uppercase text-white text-[15px]">Équipe</label>
            <select id="filtre-equipe" name="equipe" defaultValue={equipeId} className="bg-white text-nuit text-[14px] px-2 py-1.5 max-w-[60vw]">
              <option value="">Toutes les équipes</option>
              {equipes.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
            </select>
            <button type="submit" className="bg-nuit text-white font-display uppercase px-3 py-1.5 hover:bg-bande-fonce">OK</button>
          </form>
        </div>
        {vue === 'resultats' && <SelecteurSaison saisons={saisons} active={saison} lien={(s) => lien('resultats', equipeId, s)} className="mt-4" />}
        {equipeId && (
          <nav aria-label="Filtre actif" className="mt-4 text-[14px]">
            Équipe : <strong>{equipes.find((e) => String(e.id) === equipeId)?.nom ?? 'inconnue'}</strong> · <Link href={lien(vue, '')} className="text-bande-fonce font-semibold hover:underline">voir toutes les équipes</Link>
          </nav>
        )}
        <div className="mt-6">

        {matchs.length === 0 ? (
          <Vide
            titre={vue === 'resultats' ? (archive ? `Aucun résultat en ${libelleSaison(saison)}` : 'Aucun résultat') : 'Aucun match programmé'}
            action={vue === 'resultats' ? { href: lien('avenir', equipeId), label: 'Voir les matchs à venir' } : { href: lien('resultats', equipeId), label: 'Voir les résultats' }}
          >
            {vue === 'resultats' ? 'Les scores seront publiés ici après chaque rencontre.' : 'Les prochaines rencontres seront annoncées ici dès leur programmation.'}
          </Vide>
        ) : (
          <div className="space-y-8">
            {parMois(matchs).map(([mois, liste]) => (
              <div key={mois}>
                <h2 className="flex items-baseline justify-between gap-4 font-display text-2xl uppercase text-bande border-b-2 border-bande pb-1">
                  {mois}
                  <span className="font-body normal-case text-[13px] text-encre/75">{liste.length} match{liste.length > 1 ? 's' : ''}</span>
                </h2>
                <div className="divide-y divide-filet border-b border-filet">
                  {liste.map((r) => <LigneMatch key={r.id} r={r} />)}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </>
  );
}
