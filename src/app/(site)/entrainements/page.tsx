import type { Metadata } from 'next';
import Link from 'next/link';
import { BoutonLien, Section, TitrePage, Vide } from '@/components/ui';
import { getCreneaux, getEquipesClub } from '@/lib/api';
import { formatHeure, JOURS } from '@/lib/format';

export const metadata: Metadata = { title: 'Entraînements', description: "Créneaux d'entraînement de toutes les équipes de l'AJSO Handball." };

export default async function EntrainementsPage() {
  const [creneaux, equipes] = await Promise.all([getCreneaux(), getEquipesClub()]);
  // Les créneaux n'embarquent pas la tranche d'âge : on la reprend de l'équipe complète
  const equipe = (id: number) => equipes.find((e) => e.id === id);
  const jours = [1, 2, 3, 4, 5, 6, 7].filter((j) => creneaux.some((c) => c.jour === j));

  return (
    <>
      <TitrePage titre="Entraînements">
        Deux séances d&apos;essai gratuites dans toutes les catégories. Venez en tenue de sport avec une bouteille d&apos;eau !
      </TitrePage>
      <Section>
        {jours.length === 0 ? <Vide>Le planning sera publié prochainement.</Vide> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {jours.map((j) => {
              const liste = creneaux.filter((c) => c.jour === j);
              return (
                <div key={j} className="border border-filet">
                  <h2 className="bg-bande text-white font-display text-xl uppercase px-4 py-2 flex items-baseline gap-3">
                    {JOURS[j]}
                    <span className="ml-auto font-body normal-case text-[13px]">{liste.length} créneau{liste.length > 1 ? 'x' : ''}</span>
                  </h2>
                  <ul className="divide-y divide-filet">
                    {liste.map((c) => (
                      <li key={c.id} className="px-4 py-2.5 grid grid-cols-[96px_minmax(0,1fr)] gap-x-3">
                        <p className="text-[14px] font-semibold text-bande-fonce tabular-nums">{formatHeure(c.heureDebut)} – {formatHeure(c.heureFin)}</p>
                        <div className="min-w-0">
                          <Link href={`/equipes/${c.equipe.id}`} className="font-display uppercase text-nuit hover:underline">{(equipe(c.equipe.id) ?? c.equipe).nom}</Link>
                          <p className="text-[13px] text-encre/80">{c.gymnase.nom}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <BoutonLien href="/inscriptions">S&apos;inscrire</BoutonLien>
          <BoutonLien href="/club" variante="nuit">Voir les gymnases</BoutonLien>
        </div>
      </Section>
    </>
  );
}
