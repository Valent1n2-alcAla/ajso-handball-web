import type { Metadata } from 'next';
import Link from 'next/link';
import Forme from '@/components/Forme';
import Logo from '@/components/Logo';
import { CONTENEUR, TitrePage, Vide } from '@/components/ui';
import { getClassements, getDerniersResultats, getEquipesClub } from '@/lib/api';
import { bilan } from '@/lib/stats';
import { ageEquipe, familleEquipe } from '@/lib/site';
import type { Equipe } from '@/lib/types';
import ImageContenu from '@/components/ImageContenu';

export const metadata: Metadata = { title: 'Équipes', description: "Toutes les équipes de l'AJSO Handball, de l'école de hand aux seniors." };

const FAMILLES = [
  ['seniors-m', 'Séniors masculins'],
  ['seniors-f', 'Séniors féminines'],
  ['jeunes', 'Équipes jeunes'],
] as const;

export default async function EquipesPage() {
  const [equipes, resultats, classements] = await Promise.all([getEquipesClub(), getDerniersResultats(), getClassements()]);
  const tri = (l: Equipe[]) => [...l].sort((a, b) => ageEquipe(a).rang - ageEquipe(b).rang || (a.ordre ?? 0) - (b.ordre ?? 0));

  return (
    <>
      <TitrePage titre="Nos équipes">{equipes.length > 0 ? `${equipes.length} équipes engagées, du Baby hand aux séniors.` : null}</TitrePage>
      <div className={`${CONTENEUR} pt-4`}>
        {equipes.length === 0 && <Vide>Les équipes seront affichées ici.</Vide>}
        {FAMILLES.map(([cle, titre]) => {
          const liste = tri(equipes.filter((e) => familleEquipe(e) === cle));
          if (!liste.length) return null;
          return (
            <section key={cle} id={cle} className="pt-6 scroll-mt-4">
              <h2 className="font-display text-[1.75rem] uppercase text-bande border-b-2 border-bande pb-1 mb-5">{titre}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {liste.map((e) => {
                  const b = bilan(resultats.filter((r) => r.equipe.id === e.id));
                  const ids = [e.championnat?.id, ...(e.competitions ?? []).map((c) => c.id)];
                  // Rang dans la compétition la plus récente qui a un classement
                  const place = [...ids].reverse().map((id) => classements.find((l) => l.estAjso && l.championnat.id === id)).find(Boolean);
                  return (
                    <Link key={e.id} href={`/equipes/${e.id}`} className="group border border-filet flex flex-col hover:border-bande">
                      <div className="relative aspect-[16/10] bg-papier overflow-hidden">
                        {e.photo
                          ? <ImageContenu src={e.photo} alt="" fill sizes="(min-width: 1024px) 270px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                          : <span aria-hidden className="absolute inset-0 flex items-center justify-center opacity-25"><Logo size={90} decoratif /></span>}
                        {place && (
                          <span className="absolute top-0 right-0 bg-nuit text-white font-display text-[15px] px-2 py-0.5">
                            {place.position}<sup>{place.position === 1 ? 'er' : 'e'}</sup>
                          </span>
                        )}
                      </div>
                      <div className="p-3 border-t-4 border-bande flex-1 flex flex-col">
                        <p className="font-display uppercase text-lg leading-tight text-nuit group-hover:underline">{e.nom}</p>
                        <p className="text-[13px] text-encre/80 mt-0.5">{e.championnat ? e.championnat.nom : 'Pratique sans championnat'}</p>
                        {e.entente && <p className="text-[13px] text-encre/80">Entente avec {e.entente}</p>}
                        {b.joues > 0 && (
                          <div className="flex items-center justify-between gap-2 mt-auto pt-2 text-[13px]">
                            <span><span className="text-victoire font-semibold">{b.victoires}V</span> · {b.nuls}N · <span className="text-defaite font-semibold">{b.defaites}D</span></span>
                            <Forme forme={b.forme} taille="sm" />
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
