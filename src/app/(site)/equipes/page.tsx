import type { Metadata } from 'next';
import Link from 'next/link';
import Forme from '@/components/Forme';
import { PageHero, Section, Vide } from '@/components/ui';
import { getClassements, getDerniersResultats, getEquipesClub } from '@/lib/api';
import { bilan } from '@/lib/stats';
import type { Equipe } from '@/lib/types';
import ImageContenu from '@/components/ImageContenu';
import { couleurTranche, styleCategorie } from '@/lib/categories';

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
        {tri.length > 1 && (
          <nav aria-label="Catégories" className="rangee-defilante flex gap-2 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 mb-12">
            {tri.map(([tranche, liste]) => (
              <a key={tranche} href={`#${encodeURIComponent(tranche)}`} className="shrink-0 flex items-center gap-2.5 bg-papier hover:bg-nuit hover:text-white transition-colors px-4 py-2.5 font-display uppercase tracking-wide">
                <span aria-hidden className="w-2.5 h-2.5 rotate-45" style={{ background: couleurTranche(tranche).fond }} />
                {tranche}<span className="font-mono text-xs opacity-60">{liste.length}</span>
              </a>
            ))}
          </nav>
        )}
        <div className="space-y-16 md:space-y-20">
          {tri.map(([tranche, liste]) => (
            <div key={tranche} id={encodeURIComponent(tranche)} className="scroll-mt-28">
              <h2 className="font-display text-4xl md:text-5xl uppercase mb-8 flex items-center gap-4">
                <span aria-hidden className="w-5 h-5 rotate-45 inline-block" style={{ background: couleurTranche(tranche).fond }} />
                {tranche}
                <span aria-hidden className="flex-1 h-px bg-nuit/10 ml-2" />
                <span className="font-mono text-xs text-nuit/60 tracking-widest">{liste.length} équipe{liste.length > 1 ? 's' : ''}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {liste.map((e) => {
                  const b = bilan(resultats.filter((r) => r.equipe.id === e.id));
                  const ids = [e.championnat?.id, ...(e.competitions ?? []).map((c) => c.id)];
                  // Rang dans la compétition la plus récente qui a un classement
                  const place = [...ids].reverse().map((id) => classements.find((l) => l.estAjso && l.championnat.id === id)).find(Boolean);
                  return (
                    <Link key={e.id} href={`/equipes/${e.id}`} style={styleCategorie(e)} className="group relative bg-nuit text-white overflow-hidden min-h-[280px] md:min-h-[320px] flex flex-col shadow-lg shadow-nuit/10 hover:shadow-2xl hover:shadow-nuit/30 hover:-translate-y-1 transition duration-300">
                      {e.photo ? (
                        <ImageContenu src={e.photo} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition duration-500" />
                      ) : (
                        <>
                          <span aria-hidden className="absolute -right-16 -top-16 w-56 h-56 rotate-45 bg-losange opacity-50 group-hover:opacity-90 transition-opacity duration-500" />
                        </>
                      )}
                      <span aria-hidden className="absolute top-0 inset-x-0 h-1.5 bg-(--cat) z-10" />
                      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-nuit via-nuit/60 to-transparent" />
                      <span aria-hidden className="absolute right-7 top-20 w-9 h-9 rotate-45 bg-(--cat) group-hover:rotate-[135deg] transition-transform duration-700" />
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
                        <p className="text-sm text-white/70 mt-2">{e.championnat ? e.championnat.nom : 'Pratique sans championnat'}</p>
                        {e.entente && <p className="font-mono text-[10px] uppercase tracking-widest text-glacier mt-1">Entente avec {e.entente}</p>}
                        <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-white/10 min-h-12">
                          {b.joues > 0 ? (
                            <>
                              <span className="font-mono text-sm">
                                <span className="text-victoire-clair">{b.victoires}V</span> · <span className="text-jaune">{b.nuls}N</span> · <span className="text-defaite-clair">{b.defaites}D</span>
                              </span>
                              <Forme forme={b.forme} taille="sm" />
                            </>
                          ) : (
                            <span className="font-display uppercase tracking-wide text-jaune">Voir l&apos;équipe <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1">→</span></span>
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
