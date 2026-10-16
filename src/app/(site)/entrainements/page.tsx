import type { Metadata } from 'next';
import Link from 'next/link';
import { BoutonLien, PageHero, Section, Vide } from '@/components/ui';
import { getCreneaux } from '@/lib/api';
import { formatHeure, JOURS } from '@/lib/format';

export const metadata: Metadata = { title: 'Entraînements', description: "Créneaux d'entraînement de toutes les équipes de l'AJSO Handball." };

export default async function EntrainementsPage() {
  const creneaux = await getCreneaux();
  const jours = [1, 2, 3, 4, 5, 6, 7].filter((j) => creneaux.some((c) => c.jour === j));

  return (
    <>
      <PageHero surtitre="Planning hebdomadaire" titre="Entraînements">
        Deux séances d&apos;essai gratuites dans toutes les catégories. Venez en tenue de sport avec une bouteille d&apos;eau !
      </PageHero>
      <Section>
        {jours.length === 0 ? <Vide>Le planning sera publié prochainement.</Vide> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jours.map((j) => (
              <div key={j} className="bg-papier">
                <h2 className="bg-nuit text-white font-display text-2xl uppercase px-6 py-3 flex items-center gap-3">
                  <span className="w-3 h-3 rotate-45 bg-jaune" />{JOURS[j]}
                </h2>
                <ul className="divide-y divide-nuit/10">
                  {creneaux.filter((c) => c.jour === j).map((c) => (
                    <li key={c.id} className="px-6 py-4">
                      <p className="font-mono text-sm text-violet font-semibold">{formatHeure(c.heureDebut)} – {formatHeure(c.heureFin)}</p>
                      <Link href={`/equipes/${c.equipe.id}`} className="font-display text-xl uppercase hover:text-roi">{c.equipe.nom}</Link>
                      <p className="text-sm text-nuit/55">{c.gymnase.nom}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        <div className="mt-14 flex flex-wrap gap-3">
          <BoutonLien href="/inscriptions" variante="nuit">S&apos;inscrire</BoutonLien>
          <BoutonLien href="/club">Voir les gymnases</BoutonLien>
        </div>
      </Section>
    </>
  );
}
