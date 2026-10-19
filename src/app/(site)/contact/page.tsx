import type { Metadata } from 'next';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { CONTENEUR, TitrePage } from '@/components/ui';
import { getClub, getEquipesClub, getGymnases } from '@/lib/api';
import FormulaireContact from './FormulaireContact';

export const metadata: Metadata = {
  title: 'Contact',
  description: "Contactez l'AJS Ouistreham Handball : inscriptions, séances d'essai, partenariats ou bénévolat. Adresse et gymnases du club.",
};

/** Intertitre souligné, comme sur une page de contenu classique. */
function Intertitre({ children }: { children: string }) {
  return <h2 className="font-semibold underline underline-offset-2 text-nuit mt-5 mb-2">{children}</h2>;
}

export default async function ContactPage({ searchParams }: PageProps<'/contact'>) {
  const { sujet } = await searchParams;
  const [club, gymnases, equipes] = await Promise.all([getClub(), getGymnases(), getEquipesClub()]);

  return (
    <>
      <TitrePage titre="Contact" />
      <div className={`${CONTENEUR} pt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]`}>
        <div className="text-[14.5px] leading-relaxed">
          <Logo size={110} className="mb-4" />
          <p>
            Vous cherchez un club <strong>convivial</strong>, <strong>formateur</strong> et <strong>familial</strong>&nbsp;? Rejoignez l&apos;{club?.nom ?? 'AJS Ouistreham Handball'}&nbsp;!
          </p>

          {equipes.length > 0 && (
            <>
              <Intertitre>Nos équipes :</Intertitre>
              <ul className="liste-chevrons space-y-0.5">
                {equipes.map((e) => (
                  <li key={e.id}>
                    <Link href={`/equipes/${e.id}`} className="hover:underline"><strong>{e.nom}</strong></Link>
                    {e.championnat ? ` (${e.championnat.nom})` : ''}
                  </li>
                ))}
              </ul>
            </>
          )}

          <Intertitre>Horaires d&apos;entraînement</Intertitre>
          <ul className="liste-chevrons">
            <li>Vous trouverez le planning d&apos;entraînement <Link href="/entrainements" className="text-bande-fonce font-semibold hover:underline">sur cette page</Link></li>
          </ul>

          <Intertitre>Modalités d&apos;inscription</Intertitre>
          <ul className="liste-chevrons">
            <li>Toutes les infos sur la page <Link href="/inscriptions" className="text-bande-fonce font-semibold hover:underline">Inscriptions</Link></li>
          </ul>

          <Intertitre>Pour nous contacter</Intertitre>
          <ul className="liste-chevrons space-y-0.5">
            {club?.adresse && <li>{club.adresse}</li>}
            {club?.telephone && <li><a href={`tel:${club.telephone.replace(/\s/g, '')}`} className="hover:underline">{club.telephone}</a></li>}
            {club?.email && <li><a href={`mailto:${club.email}`} className="text-bande-fonce font-semibold hover:underline break-all">{club.email}</a></li>}
            {club?.president && <li>Président : {club.president}</li>}
          </ul>

          {gymnases.length > 0 && (
            <>
              <Intertitre>Nos gymnases</Intertitre>
              <ul className="liste-chevrons space-y-0.5">
                {gymnases.map((g) => (
                  <li key={g.id}><strong>{g.nom}</strong> · {[g.adresse, g.codePostal, g.ville].filter(Boolean).join(' ')}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        <section aria-labelledby="titre-formulaire" className="lg:border-l lg:border-filet lg:pl-10">
          <h2 id="titre-formulaire" className="font-display uppercase text-bande text-[1.75rem] mb-4">Nous écrire</h2>
          <FormulaireContact sujetInitial={typeof sujet === 'string' ? sujet.slice(0, 100) : ''} />
        </section>
      </div>
    </>
  );
}
