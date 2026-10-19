import type { Metadata } from 'next';
import { PageHero, Section } from '@/components/ui';
import { getClub } from '@/lib/api';

export const metadata: Metadata = { title: 'Mentions légales', robots: { index: false } };

export default async function MentionsPage() {
  const club = await getClub();
  return (
    <>
      <PageHero surtitre="Informations" titre="Mentions légales" />
      <Section className="max-w-3xl! space-y-8 text-nuit/80">
        <div>
          <h2 className="font-display text-2xl uppercase mb-2">Éditeur</h2>
          <p>{club?.nom ?? 'AJS Ouistreham Handball'}, association loi 1901.<br />{club?.adresse}</p>
          {club?.president && <p>Directeur de la publication : {club.president}, président.</p>}
          {club?.email && <p>Contact : {club.email}</p>}
        </div>
        <div>
          <h2 className="font-display text-2xl uppercase mb-2">Hébergeur</h2>
          {/* Mention obligatoire (LCEN, art. 6) : à renseigner avec les coordonnées réelles de l'hébergeur. */}
          <p>À compléter : nom, adresse et téléphone de l&apos;hébergeur du site.</p>
        </div>
        <div>
          <h2 className="font-display text-2xl uppercase mb-2">Données personnelles</h2>
          <p>
            Les informations transmises via le formulaire de contact sont utilisées uniquement pour répondre à votre demande
            et ne sont jamais cédées à des tiers. Conformément au RGPD, vous pouvez demander leur consultation ou suppression
            en écrivant au club.
          </p>
        </div>
        <div>
          <h2 className="font-display text-2xl uppercase mb-2">Droit à l&apos;image</h2>
          <p>Les photos publiées le sont avec l&apos;accord des personnes concernées. Pour tout retrait, contactez le club.</p>
        </div>
      </Section>
    </>
  );
}
