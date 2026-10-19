import type { Metadata } from 'next';
import { BoutonLien, Chevron, Section, TitrePage, Vide } from '@/components/ui';
import { getPartenaires } from '@/lib/api';
import type { Partenaire } from '@/lib/types';
import ImageContenu from '@/components/ImageContenu';

export const metadata: Metadata = {
  title: 'Partenaires',
  description: "Les partenaires et soutiens de l'AJS Ouistreham Handball, et comment devenir partenaire du club.",
};

const NIVEAUX: [Partenaire['niveau'], string][] = [
  ['principal', 'Partenaires principaux'],
  ['officiel', 'Partenaires institutionnels'],
  ['partenaire', 'Partenaires'],
];

function CartePartenaire({ p, grand }: { p: Partenaire; grand: boolean }) {
  const contenu = (
    <>
      <div className={`flex items-center justify-center ${grand ? 'h-28' : 'h-20'}`}>
        {p.logo ? (
          <ImageContenu src={p.logo} alt={p.nom} width={480} height={224} sizes="(min-width: 768px) 25vw, 50vw" className="max-h-full w-auto object-contain" />
        ) : (
          <span className="font-display text-2xl uppercase text-center leading-tight text-nuit">{p.nom}</span>
        )}
      </div>
      {p.logo && <p className="font-display uppercase text-center text-nuit mt-3">{p.nom}</p>}
      {p.description && <p className="text-[14px] text-center mt-1">{p.description}</p>}
      {p.url && <p className="mt-3 text-center font-display uppercase text-[15px] text-bande-fonce group-hover:underline">Visiter le site</p>}
    </>
  );
  const cls = 'group flex flex-col justify-center bg-white border border-filet border-t-4 border-t-bande p-6 hover:border-bande';
  return p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer" className={cls} aria-label={`${p.nom} (site du partenaire, nouvel onglet)`}>{contenu}</a> : <div className={cls}>{contenu}</div>;
}

export default async function PartenairesPage() {
  const partenaires = await getPartenaires();

  return (
    <>
      <TitrePage titre="Partenaires">
        Ils accompagnent le club et rendent possible chaque saison. Soutenez-les comme ils nous soutiennent !
      </TitrePage>
      <Section>
        {partenaires.length === 0 && <Vide>Nos partenaires seront présentés ici.</Vide>}
        <div className="space-y-10">
          {NIVEAUX.map(([niveau, titre]) => {
            const liste = partenaires.filter((p) => p.niveau === niveau);
            if (liste.length === 0) return null;
            return (
              <div key={niveau}>
                <h2 className="font-display text-[1.6rem] uppercase text-bande border-b-2 border-bande pb-1 mb-5">{titre}</h2>
                <div className={`grid grid-cols-1 gap-5 ${niveau === 'principal' ? 'md:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
                  {liste.map((p) => <CartePartenaire key={p.id} p={p} grand={niveau === 'principal'} />)}
                </div>
              </div>
            );
          })}
        </div>
      </Section>
      <Section>
        <div className="bg-bande text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h2 className="font-display text-[1.9rem] uppercase leading-tight">Devenez partenaire de l&apos;AJSO</h2>
            <p className="text-[14.5px] mt-1 max-w-xl">Visibilité au gymnase, sur nos maillots, notre site et nos réseaux. Parlons-en !</p>
          </div>
          <BoutonLien href="/contact?sujet=Partenariat" variante="nuit">Nous contacter<Chevron className="w-2 h-2.5" /></BoutonLien>
        </div>
      </Section>
    </>
  );
}
