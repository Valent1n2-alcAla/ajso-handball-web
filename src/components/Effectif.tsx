import type { StatJoueur } from '@/lib/stats';
import type { Joueur, Poste } from '@/lib/types';
import ImageContenu from '@/components/ImageContenu';
import Logo from '@/components/Logo';

const GROUPES: [string, Poste[]][] = [
  ['Gardiens', ['gardien']],
  ['Arrières & demi-centres', ['arriere-gauche', 'demi-centre', 'arriere-droit']],
  ['Ailiers', ['ailier-gauche', 'ailier-droit']],
  ['Pivots', ['pivot']],
];

export const POSTES: Record<Poste, string> = {
  gardien: 'Gardien',
  'ailier-gauche': 'Ailier gauche',
  'arriere-gauche': 'Arrière gauche',
  'demi-centre': 'Demi-centre',
  pivot: 'Pivot',
  'arriere-droit': 'Arrière droit',
  'ailier-droit': 'Ailier droit',
  polyvalent: 'Polyvalent',
};

function CarteJoueur({ j, stat }: { j: Joueur; stat?: StatJoueur }) {
  return (
    <article className="border border-filet bg-white flex flex-col">
      <div className="relative aspect-square sm:aspect-[3/4] bg-papier overflow-hidden">
        {j.photo ? (
          <ImageContenu src={j.photo} alt="" fill sizes="(min-width: 1024px) 190px, (min-width: 640px) 33vw, 50vw" className="object-cover object-top" />
        ) : (
          <span aria-hidden className="absolute inset-0 flex items-center justify-center opacity-25"><Logo size={70} decoratif /></span>
        )}
        {j.capitaine && <span className="absolute top-0 left-0 bg-jaune text-nuit font-display uppercase text-[13px] px-2 py-0.5">Capitaine</span>}
      </div>
      <div className="p-2.5 flex items-start gap-2.5 border-t-4 border-bande">
        {j.numero != null && <span className="font-display text-2xl leading-none text-bande">{j.numero}</span>}
        <div className="min-w-0">
          <p className="font-display uppercase text-nuit leading-tight">{j.nomAffiche}</p>
          {j.poste && <p className="text-[12.5px] text-encre/75">{POSTES[j.poste]}</p>}
          {stat && stat.matchs > 0 && (
            <p className="text-[12.5px] text-encre/75">{stat.buts} but{stat.buts > 1 ? 's' : ''} · {stat.matchs} match{stat.matchs > 1 ? 's' : ''}</p>
          )}
        </div>
      </div>
    </article>
  );
}

/** Effectif regroupé par poste ; les joueurs sans poste ou polyvalents ferment la liste. */
export default function Effectif({ joueurs, stats = [] }: { joueurs: Joueur[]; stats?: StatJoueur[] }) {
  const statDe = (id: number) => stats.find((s) => s.joueur.id === id);
  const ranges = new Set<number>();
  const blocs = GROUPES.map(([titre, postes]) => {
    const liste = joueurs.filter((j) => j.poste && postes.includes(j.poste));
    liste.forEach((j) => ranges.add(j.id));
    return [titre, liste] as const;
  });
  const autres = joueurs.filter((j) => !ranges.has(j.id));
  // Sans aucun poste renseigné : un seul bloc « Joueurs » plutôt que « Polyvalents »
  if (autres.length) blocs.push([autres.length === joueurs.length ? 'Joueurs' : 'Polyvalents', autres]);

  return (
    <div className="space-y-8">
      {blocs.filter(([, l]) => l.length).map(([titre, liste]) => (
        <div key={titre}>
          <h3 className="font-display uppercase text-xl text-nuit mb-3">{titre}</h3>
          <div className="grid grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
            {liste.map((j) => <CarteJoueur key={j.id} j={j} stat={statDe(j.id)} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
