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

      <Section className="grid md:grid-cols-[1fr_1.4fr] gap-12 items-center">
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
        <Section titre="Nos valeurs">
          <div className="grid md:grid-cols-3 gap-6">
            {VALEURS.map(([t, d], i) => (
              <div key={t} className="border border-white/10 p-8 relative overflow-hidden">
                <span className="font-display text-7xl text-white/5 absolute right-4 top-2">{i + 1}</span>
                <h3 className="font-display text-3xl uppercase text-jaune mb-3">{t}</h3>
                <p className="text-white/70">{d}</p>
              </div>
            ))}
          </div>
        </Section>
      </section>

      <Section titre="Le bureau">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {club?.president && (
            <div className="bg-papier p-7">
              <p className="font-mono text-[11px] uppercase tracking-widest text-violet">Président</p>
              <p className="font-display text-2xl uppercase mt-1">{club.president}</p>
            </div>
          )}
          {club?.contact && club.contact !== club.president && (
            <div className="bg-papier p-7">
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
        <Section titre="Nos gymnases">
          <div className="grid md:grid-cols-2 gap-6">
            {gymnases.map((g) => {
              const adresse = [g.adresse, g.codePostal, g.ville].filter(Boolean).join(' ');
              return (
                <div key={g.id} className="bg-white p-8 flex flex-col gap-4">
                  <h3 className="font-display text-3xl uppercase">{g.nom}</h3>
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
