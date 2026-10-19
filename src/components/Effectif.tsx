import type { StatJoueur } from '@/lib/stats';
import type { Joueur, Poste } from '@/lib/types';
import ImageContenu from '@/components/ImageContenu';

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
    <article className="group relative bg-nuit text-white overflow-hidden aspect-[3/4] flex flex-col">
      {j.photo ? (
        <ImageContenu src={j.photo} alt="" fill sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw" className="object-cover object-top group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <span aria-hidden className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-2/3 aspect-square rotate-45 bg-losange opacity-60 group-hover:opacity-90 transition-opacity" />
      )}
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-nuit via-nuit/40 to-transparent" />
      {j.numero != null && (
        <span className="relative font-display text-5xl md:text-6xl leading-none p-4 text-white/90 drop-shadow">{j.numero}</span>
      )}
      <div className="relative mt-auto p-4">
        {j.capitaine && <span className="inline-block bg-jaune text-nuit font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 mb-2">Capitaine</span>}
        <p className="font-display text-lg md:text-xl uppercase leading-tight">{j.nomAffiche}</p>
        {j.poste && <p className="font-mono text-[11px] uppercase tracking-widest text-glacier mt-1">{POSTES[j.poste]}</p>}
        {stat && stat.matchs > 0 && (
          <p className="font-mono text-[11px] text-white/70 mt-1">{stat.buts} but{stat.buts > 1 ? 's' : ''} · {stat.matchs} match{stat.matchs > 1 ? 's' : ''}</p>
        )}
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
    <div className="space-y-10">
      {blocs.filter(([, l]) => l.length).map(([titre, liste]) => (
        <div key={titre}>
          <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-violet mb-4">{titre}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {liste.map((j) => <CarteJoueur key={j.id} j={j} stat={statDe(j.id)} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
