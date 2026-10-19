import type { Metadata } from 'next';
import { BoutonLien, PageHero, Section, Vide } from '@/components/ui';
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
          <span className="font-display text-2xl uppercase text-center leading-tight">{p.nom}</span>
        )}
      </div>
      {p.logo && <p className="font-display uppercase text-center mt-4">{p.nom}</p>}
      {p.description && <p className="text-sm text-nuit/70 text-center mt-2">{p.description}</p>}
      {p.url && <p className="mt-5 text-center font-mono text-[11px] uppercase tracking-widest text-roi">Visiter le site <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1">→</span></p>}
    </>
  );
  const cls = 'group relative overflow-hidden flex flex-col justify-center bg-white ring-1 ring-nuit/10 p-8 pt-10 shadow-sm hover:shadow-xl hover:shadow-nuit/10 hover:-translate-y-1 transition duration-300 before:absolute before:top-0 before:inset-x-0 before:h-1 before:bg-losange';
  return p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer" className={cls} aria-label={`${p.nom} (site du partenaire, nouvel onglet)`}>{contenu}</a> : <div className={cls}>{contenu}</div>;
}

export default async function PartenairesPage() {
  const partenaires = await getPartenaires();

  return (
    <>
      <PageHero surtitre="Merci à eux" titre="Partenaires">
        Ils accompagnent le club et rendent possible chaque saison. Soutenez-les comme ils nous soutiennent !
      </PageHero>
      <Section>
        {partenaires.length === 0 && <Vide>Nos partenaires seront présentés ici.</Vide>}
        <div className="space-y-14">
          {NIVEAUX.map(([niveau, titre]) => {
            const liste = partenaires.filter((p) => p.niveau === niveau);
            if (liste.length === 0) return null;
            return (
              <div key={niveau}>
                <h2 className="font-display text-3xl md:text-4xl uppercase mb-8 flex items-center gap-4">
                  <span aria-hidden className="w-3 h-3 rotate-45 bg-jaune" />{titre}<span aria-hidden className="flex-1 h-px bg-nuit/10" />
                </h2>
                <div className={`grid grid-cols-1 gap-5 ${niveau === 'principal' ? 'md:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
                  {liste.map((p) => <CartePartenaire key={p.id} p={p} grand={niveau === 'principal'} />)}
                </div>
              </div>
            );
          })}
        </div>
      </Section>
      <section className="relative bg-losange text-white overflow-hidden">
        <div aria-hidden className="absolute -right-24 top-1/2 -translate-y-1/2 w-[380px] aspect-square rotate-45 border-[16px] border-white/10" />
        <div className="relative max-w-[1400px] mx-auto px-4 md:px-10 py-16 md:py-20 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-5xl md:text-6xl uppercase leading-[1.02]">Devenez partenaire</h2>
            <p className="text-white/80 mt-3 max-w-xl">Visibilité au gymnase, sur nos maillots, notre site et nos réseaux. Parlons-en !</p>
          </div>
          <BoutonLien href="/contact?sujet=Partenariat">Nous contacter</BoutonLien>
        </div>
      </section>
    </>
  );
}
