import type { Metadata } from 'next';
import Link from 'next/link';
import Forme from '@/components/Forme';
import { PageHero, Section, Vide } from '@/components/ui';
import { getClassements, getDerniersResultats, getEquipesClub } from '@/lib/api';
import { bilan } from '@/lib/stats';
import type { Equipe } from '@/lib/types';

export const metadata: Metadata = { title: 'Équipes', description: "Toutes les équipes de l'AJSO Handball, de l'école de hand aux seniors." };

const ORDRE = ['Adultes', 'Jeunes', 'École de hand'];

export default async function EquipesPage() {
  const [equipes, resultats, classements] = await Promise.all([getEquipesClub(), getDerniersResultats(), getClassements()]);

  const groupes = new Map<string, Equipe[]>();
  for (const e of equipes) {
    const cle = e.categorie?.tranche?.nom ?? 'Autres';
    groupes.set(cle, [...(groupes.get(cle) ?? []), e]);
  }
  const rang = (t: string) => (ORDRE.includes(t) ? ORDRE.indexOf(t) : ORDRE.length);
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
                {liste.map((e) => {
                  const b = bilan(resultats.filter((r) => r.equipe.id === e.id));
                  const ids = [e.championnat?.id, ...(e.competitions ?? []).map((c) => c.id)];
                  // Rang dans la compétition la plus récente qui a un classement
                  const place = [...ids].reverse().map((id) => classements.find((l) => l.estAjso && l.championnat.id === id)).find(Boolean);
                  return (
                    <Link key={e.id} href={`/equipes/${e.id}`} className="group relative bg-nuit text-white overflow-hidden min-h-[300px] flex flex-col">
                      {e.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={e.photo} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition duration-500" />
                      ) : (
                        <span aria-hidden className="absolute -right-16 -top-16 w-56 h-56 rotate-45 bg-losange opacity-40 group-hover:opacity-80 transition-opacity duration-500" />
                      )}
                      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-nuit via-nuit/60 to-transparent" />
                      <div className="relative p-7 flex flex-col flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-mono text-[11px] uppercase tracking-widest text-glacier">{e.categorie?.nom}</p>
                          {place && (
                            <span className="font-display text-lg bg-jaune text-nuit px-2.5 leading-7">
                              {place.position}<sup className="text-[10px]">{place.position === 1 ? 'er' : 'e'}</sup>
                            </span>
                          )}
                        </div>
                        <p className="font-display text-4xl uppercase mt-auto leading-none">{e.nom}</p>
                        <p className="text-sm text-white/60 mt-2">{e.championnat ? e.championnat.nom : 'Pratique sans championnat'}</p>
                        {e.entente && <p className="font-mono text-[10px] uppercase tracking-widest text-glacier mt-1">Entente avec {e.entente}</p>}
                        <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-white/10 min-h-12">
                          {b.joues > 0 ? (
                            <>
                              <span className="font-mono text-sm">
                                <span className="text-emerald-400">{b.victoires}V</span> · <span className="text-jaune">{b.nuls}N</span> · <span className="text-rose-400">{b.defaites}D</span>
                              </span>
                              <Forme forme={b.forme} taille="sm" />
                            </>
                          ) : (
                            <span className="font-display uppercase tracking-wide text-jaune">Voir l&apos;équipe →</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
