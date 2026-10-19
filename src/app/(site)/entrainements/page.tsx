import type { Metadata } from 'next';
import Link from 'next/link';
import { BoutonLien, PageHero, Section, Vide } from '@/components/ui';
import { getCreneaux, getEquipesClub } from '@/lib/api';
import { styleCategorie } from '@/lib/categories';
import { formatHeure, JOURS } from '@/lib/format';

export const metadata: Metadata = { title: 'Entraînements', description: "Créneaux d'entraînement de toutes les équipes de l'AJSO Handball." };

export default async function EntrainementsPage() {
  const [creneaux, equipes] = await Promise.all([getCreneaux(), getEquipesClub()]);
  // Les créneaux n'embarquent pas la tranche d'âge : on la reprend de l'équipe complète
  const equipe = (id: number) => equipes.find((e) => e.id === id);
  const jours = [1, 2, 3, 4, 5, 6, 7].filter((j) => creneaux.some((c) => c.jour === j));

  return (
    <>
      <PageHero surtitre="Planning hebdomadaire" titre="Entraînements">
        Deux séances d&apos;essai gratuites dans toutes les catégories. Venez en tenue de sport avec une bouteille d&apos;eau !
      </PageHero>
      <Section>
        {jours.length === 0 ? <Vide>Le planning sera publié prochainement.</Vide> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
            {jours.map((j) => {
              const liste = creneaux.filter((c) => c.jour === j);
              return (
                <div key={j} className="bg-white ring-1 ring-nuit/10 shadow-sm">
                  <h2 className="bg-nuit text-white font-display text-2xl uppercase px-6 py-3.5 flex items-center gap-3 motif-losanges">
                    <span aria-hidden className="w-3 h-3 rotate-45 bg-jaune" />{JOURS[j]}
                    <span className="ml-auto font-mono text-[11px] tracking-widest text-glacier">{liste.length} créneau{liste.length > 1 ? 'x' : ''}</span>
                  </h2>
                  <ul className="divide-y divide-nuit/10">
                    {liste.map((c) => (
                      <li key={c.id} style={styleCategorie(equipe(c.equipe.id) ?? c.equipe)} className="relative pl-6 pr-5 py-4 hover:bg-papier transition-colors before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 before:bg-(--cat)">
                        <p className="font-mono text-sm text-violet font-semibold tabular-nums">{formatHeure(c.heureDebut)} – {formatHeure(c.heureFin)}</p>
                        <Link href={`/equipes/${c.equipe.id}`} className="font-display text-xl uppercase hover:text-roi transition-colors">{c.equipe.nom}</Link>
                        <p className="text-sm text-nuit/65">{c.gymnase.nom}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-14 flex flex-wrap gap-3">
          <BoutonLien href="/inscriptions">S&apos;inscrire</BoutonLien>
          <BoutonLien href="/club" variante="nuit">Voir les gymnases</BoutonLien>
        </div>
      </Section>
    </>
  );
}
