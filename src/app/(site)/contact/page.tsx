import type { Metadata } from 'next';
import { PageHero, Section } from '@/components/ui';
import { getClub, getGymnases } from '@/lib/api';
import FormulaireContact from './FormulaireContact';

export const metadata: Metadata = {
  title: 'Contact',
  description: "Contactez l'AJS Ouistreham Handball : inscriptions, séances d'essai, partenariats ou bénévolat. Adresse et gymnases du club.",
};

export default async function ContactPage({ searchParams }: PageProps<'/contact'>) {
  const { sujet } = await searchParams;
  const [club, gymnases] = await Promise.all([getClub(), getGymnases()]);

  return (
    <>
      <PageHero surtitre="Une question ?" titre="Contact" />
      <Section className="grid lg:grid-cols-[1.4fr_1fr] gap-12">
        <FormulaireContact sujetInitial={typeof sujet === 'string' ? sujet.slice(0, 100) : ''} />
        <aside className="space-y-4">
          <div className="bg-nuit text-white p-8 motif-losanges space-y-4">
            <h2 className="font-display text-2xl uppercase">AJS Ouistreham Handball</h2>
            {club?.adresse && <p className="text-white/70">{club.adresse}</p>}
            {club?.email && <p><a href={`mailto:${club.email}`} className="text-jaune hover:underline">{club.email}</a></p>}
            {club?.telephone && <p><a href={`tel:${club.telephone.replace(/\s/g, '')}`} className="text-jaune hover:underline">{club.telephone}</a></p>}
          </div>
          {gymnases.map((g) => (
            <div key={g.id} className="bg-papier p-6">
              <p className="font-mono text-[11px] uppercase tracking-widest text-violet">Gymnase</p>
              <p className="font-display text-xl uppercase">{g.nom}</p>
              <p className="text-sm text-nuit/60">{[g.adresse, g.codePostal, g.ville].filter(Boolean).join(' ')}</p>
            </div>
          ))}
        </aside>
      </Section>
    </>
  );
}
