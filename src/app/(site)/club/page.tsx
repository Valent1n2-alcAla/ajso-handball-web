import type { Metadata } from 'next';
import Logo from '@/components/Logo';
import { BoutonLien, PageHero, Section } from '@/components/ui';
import { getClub, getEquipesClub, getGymnases } from '@/lib/api';

export const metadata: Metadata = { title: 'Le club', description: "Histoire, valeurs, dirigeants et gymnases de l'AJS Ouistreham Handball." };

const VALEURS = [
  ['Convivialité', 'Un club familial où chacun trouve sa place, joueurs, parents et bénévoles.'],
  ['Formation', "De l'école de hand aux seniors, nous faisons progresser chaque licencié."],
  ['Esprit d\'équipe', 'Sur le terrain comme en dehors, on joue ensemble et pour les autres.'],
];

export default async function ClubPage() {
  const [club, gymnases, equipes] = await Promise.all([getClub(), getGymnases(), getEquipesClub()]);

  return (
    <>
      <PageHero surtitre="Ouistreham Riva-Bella · Calvados" titre={<>Le <span className="text-degrade">club</span></>}>
        {club?.nom ?? 'AJS Ouistreham Handball'}
      </PageHero>

      <Section className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-12 items-center">
        <div className="relative flex justify-center">
          <div aria-hidden className="absolute inset-8 rotate-45 bg-losange opacity-15" />
          <Logo size={300} className="relative" />
        </div>
        <div>
          <h2 className="font-display text-4xl md:text-5xl uppercase mb-6">Bienvenue chez les Ratons</h2>
          <p className="text-lg text-nuit/75 leading-relaxed whitespace-pre-line">
            {club?.presentation ?? "Club de handball de Ouistreham Riva-Bella, l'AJSO accueille petits et grands, en loisir comme en compétition."}
          </p>
          <dl className="grid grid-cols-2 gap-6 mt-10">
            <div className="border-l-4 border-violet pl-4">
              <dt className="font-mono text-[11px] uppercase tracking-widest text-nuit/50">Équipes</dt>
              <dd className="font-display text-5xl">{equipes.length}</dd>
            </div>
            {club?.label && (
              <div className="border-l-4 border-jaune pl-4">
                <dt className="font-mono text-[11px] uppercase tracking-widest text-nuit/50">Label</dt>
                <dd className="font-display text-2xl uppercase leading-tight mt-1">{club.label}</dd>
              </div>
            )}
          </dl>
        </div>
      </Section>

      <section className="bg-nuit text-white motif-losanges">
        <Section sombre surtitre="L'esprit AJSO" titre="Nos valeurs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALEURS.map(([t, d], i) => (
              <div key={t} className="group border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition-colors p-8 relative overflow-hidden">
                <span aria-hidden className="font-display text-8xl text-white/10 absolute right-5 top-1 leading-none">{i + 1}</span>
                <span aria-hidden className="block w-8 h-1 bg-jaune mb-6 transition-all group-hover:w-16" />
                <h3 className="font-display text-3xl uppercase text-jaune mb-3">{t}</h3>
                <p className="text-white/75">{d}</p>
              </div>
            ))}
          </div>
        </Section>
      </section>

      <Section surtitre="Dirigeants" titre="Le bureau">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {club?.president && (
            <div className="bg-papier p-7 border-l-4 border-violet">
              <p className="font-mono text-[11px] uppercase tracking-widest text-violet">Président</p>
              <p className="font-display text-2xl uppercase mt-1">{club.president}</p>
            </div>
          )}
          {club?.contact && club.contact !== club.president && (
            <div className="bg-papier p-7 border-l-4 border-roi">
              <p className="font-mono text-[11px] uppercase tracking-widest text-violet">Contact</p>
              <p className="font-display text-2xl uppercase mt-1">{club.contact}</p>
            </div>
          )}
          <div className="bg-losange text-white p-7 flex flex-col justify-between gap-4">
            <p className="font-display text-2xl uppercase">Envie de vous investir ?</p>
            <p className="text-white/80 text-sm">Le club recherche toujours des bénévoles : arbitrage, table de marque, buvette, encadrement…</p>
            <div><BoutonLien href="/contact">Nous écrire</BoutonLien></div>
          </div>
        </div>
      </Section>

      <section className="bg-papier">
        <Section surtitre="Où nous trouver" titre="Nos gymnases">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gymnases.map((g) => {
              const adresse = [g.adresse, g.codePostal, g.ville].filter(Boolean).join(' ');
              return (
                <div key={g.id} className="relative bg-white p-8 pl-10 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:shadow-nuit/10 transition-shadow before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-losange">
                  <h3 className="font-display text-3xl uppercase leading-[1.02]">{g.nom}</h3>
                  <p className="text-nuit/70">{adresse}</p>
                  <a href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(adresse)}`} target="_blank" rel="noopener noreferrer"
                    className="font-display uppercase text-roi hover:text-violet self-start">Itinéraire →</a>
                </div>
              );
            })}
          </div>
        </Section>
      </section>
    </>
  );
}
