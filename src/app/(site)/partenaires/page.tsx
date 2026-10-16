import type { Metadata } from 'next';
import { BoutonLien, PageHero, Section, Vide } from '@/components/ui';
import { getPartenaires } from '@/lib/api';
import type { Partenaire } from '@/lib/types';

export const metadata: Metadata = { title: 'Partenaires' };

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
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.logo} alt={p.nom} className="max-h-full w-auto object-contain" />
        ) : (
          <span className="font-display text-2xl uppercase text-center">{p.nom}</span>
        )}
      </div>
      {p.logo && <p className="font-display uppercase text-center mt-4">{p.nom}</p>}
      {p.description && <p className="text-sm text-nuit/60 text-center mt-2">{p.description}</p>}
    </>
  );
  const cls = 'block bg-white border border-nuit/10 p-8 hover:border-violet hover:shadow-lg transition';
  return p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer" className={cls}>{contenu}</a> : <div className={cls}>{contenu}</div>;
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
                <h2 className="font-display text-3xl uppercase mb-6">{titre}</h2>
                <div className={`grid gap-4 ${niveau === 'principal' ? 'md:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
                  {liste.map((p) => <CartePartenaire key={p.id} p={p} grand={niveau === 'principal'} />)}
                </div>
              </div>
            );
          })}
        </div>
      </Section>
      <section className="bg-losange text-white">
        <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-16 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-4xl md:text-5xl uppercase">Devenez partenaire</h2>
            <p className="text-white/80 mt-3 max-w-xl">Visibilité au gymnase, sur nos maillots, notre site et nos réseaux. Parlons-en !</p>
          </div>
          <BoutonLien href="/contact?sujet=Partenariat">Nous contacter</BoutonLien>
        </div>
      </section>
    </>
  );
}
