import type { Metadata } from 'next';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { BoutonLien, Chevron, EnTete, Section, TitrePage } from '@/components/ui';
import ListeDocuments from '@/components/Documents';
import { getClub, getDocuments, getEquipesClub, getGymnases } from '@/lib/api';

export const metadata: Metadata = { title: 'Le club', description: "Histoire, valeurs, dirigeants et gymnases de l'AJS Ouistreham Handball." };

const VALEURS = [
  ['Convivialité', 'Un club familial où chacun trouve sa place, joueurs, parents et bénévoles.'],
  ['Formation', "De l'école de hand aux seniors, nous faisons progresser chaque licencié."],
  ['Esprit d\'équipe', 'Sur le terrain comme en dehors, on joue ensemble et pour les autres.'],
];

export default async function ClubPage() {
  const [club, gymnases, equipes, documents] = await Promise.all([getClub(), getGymnases(), getEquipesClub(), getDocuments()]);
  // Statuts, règlements, comptes rendus d'AG… (les pièces d'inscription sont sur la page Inscriptions)
  const documentsClub = documents.filter((d) => d.categorie !== 'inscription');

  return (
    <>
      <TitrePage titre="Le club" />

      <Section className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-8 items-start">
        <Logo size={200} />
        <div className="text-[15px] leading-relaxed">
          <h2 className="font-display text-[1.75rem] uppercase leading-tight text-bande mb-3">{club?.nom ?? 'AJS Ouistreham Handball'}</h2>
          <p className="whitespace-pre-line">
            {club?.presentation ?? "Club de handball de Ouistreham Riva-Bella, l'AJSO accueille petits et grands, en loisir comme en compétition."}
          </p>
          <ul className="liste-chevrons mt-4 space-y-0.5">
            <li><strong>{equipes.length} équipes</strong> engagées cette saison, <Link href="/equipes" className="text-bande-fonce font-semibold hover:underline">voir les équipes</Link></li>
            {club?.label && <li>{club.label}</li>}
            {club?.president && <li>Président : <strong>{club.president}</strong></li>}
            {club?.contact && club.contact !== club.president && <li>Contact : <strong>{club.contact}</strong></li>}
          </ul>
        </div>
      </Section>

      <Section titre="Nos valeurs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {VALEURS.map(([t, d]) => (
            <div key={t} className="border border-filet border-t-4 border-t-bande p-5">
              <h3 className="font-display text-xl uppercase text-nuit mb-1">{t}</h3>
              <p className="text-[14.5px]">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="bg-nuit text-white p-6 md:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h2 className="font-display text-2xl uppercase">Envie de vous investir&nbsp;?</h2>
            <p className="text-white/85 text-[14.5px] mt-1">Le club recherche toujours des bénévoles : arbitrage, table de marque, buvette, encadrement…</p>
          </div>
          <BoutonLien href="/benevoles" variante="jaune">Voir les besoins<Chevron className="w-2 h-2.5" /></BoutonLien>
        </div>
      </Section>

      {documentsClub.length > 0 && (
        <Section titre="Documents">
          <ListeDocuments documents={documentsClub} />
        </Section>
      )}

      {gymnases.length > 0 && (
        <Section>
          <EnTete titre="Nos gymnases" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gymnases.map((g) => {
              const adresse = [g.adresse, g.codePostal, g.ville].filter(Boolean).join(' ');
              return (
                <div key={g.id} className="border border-filet p-5">
                  <h3 className="font-display text-xl uppercase text-nuit">{g.nom}</h3>
                  <p className="text-[14.5px] mt-1">{adresse}</p>
                  <a href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(adresse)}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 font-display uppercase text-bande-fonce hover:underline">
                    Itinéraire<Chevron className="w-2 h-2.5" /><span className="sr-only">(OpenStreetMap, nouvel onglet)</span>
                  </a>
                </div>
              );
            })}
          </div>
        </Section>
      )}
    </>
  );
}
