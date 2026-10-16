import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LigneMatch } from '@/components/Match';
import { Badge, PageHero, Section, Vide } from '@/components/ui';
import { getCreneaux, getDerniersResultats, getEquipe, getProchainsMatchs } from '@/lib/api';
import { formatHeure, JOURS } from '@/lib/format';

export async function generateMetadata({ params }: PageProps<'/equipes/[id]'>): Promise<Metadata> {
  const equipe = await getEquipe((await params).id);
  return { title: equipe ? equipe.nom : 'Équipe' };
}

export default async function EquipePage({ params }: PageProps<'/equipes/[id]'>) {
  const { id } = await params;
  const equipe = await getEquipe(id);
  if (!equipe || !equipe.estAjso) notFound();

  const filtre = `&equipe=${equipe.id}`;
  const [prochains, resultats, creneaux] = await Promise.all([
    getProchainsMatchs(filtre), getDerniersResultats(filtre), getCreneaux(`?equipe=${equipe.id}`),
  ]);

  return (
    <>
      <PageHero surtitre={equipe.categorie?.nom ?? 'Équipe'} titre={equipe.nom}>
        <div className="flex flex-wrap gap-2 mb-4">
          {equipe.championnat && <Badge ton="jaune">{equipe.championnat.nom}</Badge>}
          {equipe.championnat && <span className="font-mono text-xs uppercase tracking-widest text-white/60 self-center">{equipe.championnat.niveau}</span>}
        </div>
        {equipe.description}
      </PageHero>

      <Section className="grid lg:grid-cols-[1fr_380px] gap-12">
        <div className="space-y-16">
          {equipe.photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={equipe.photo} alt={`Équipe ${equipe.nom}`} className="w-full aspect-[16/9] object-cover" />
          )}
          <div>
            <h2 className="font-display text-3xl md:text-4xl uppercase mb-6">Prochains matchs</h2>
            {prochains.length === 0 ? <Vide>Aucun match programmé.</Vide> : (
              <div className="divide-y divide-nuit/10 border-y border-nuit/10">
                {prochains.map((r) => <LigneMatch key={r.id} r={r} />)}
              </div>
            )}
          </div>
          <div>
            <h2 className="font-display text-3xl md:text-4xl uppercase mb-6">Résultats</h2>
            {resultats.length === 0 ? <Vide>Pas encore de résultat.</Vide> : (
              <div className="divide-y divide-nuit/10 border-y border-nuit/10">
                {resultats.map((r) => <LigneMatch key={r.id} r={r} />)}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-nuit text-white p-7 motif-losanges">
            <h2 className="font-display text-2xl uppercase mb-5">Entraînements</h2>
            {creneaux.length === 0 ? <p className="text-white/50 text-sm">Horaires à venir.</p> : (
              <ul className="space-y-4">
                {creneaux.map((c) => (
                  <li key={c.id} className="border-l-2 border-jaune pl-4">
                    <p className="font-display text-lg uppercase">{JOURS[c.jour]}</p>
                    <p className="font-mono text-sm text-glacier">{formatHeure(c.heureDebut)} – {formatHeure(c.heureFin)}</p>
                    <p className="text-sm text-white/60">{c.gymnase.nom}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {equipe.entraineur && (
            <div className="bg-papier p-7">
              <p className="font-mono text-[11px] uppercase tracking-widest text-violet mb-1">Entraîneur</p>
              <p className="font-display text-2xl uppercase">{equipe.entraineur}</p>
            </div>
          )}
        </aside>
      </Section>
    </>
  );
}
