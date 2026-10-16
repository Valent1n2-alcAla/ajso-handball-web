import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Effectif from '@/components/Effectif';
import Forme from '@/components/Forme';
import { CarteMatch, LigneMatch } from '@/components/Match';
import TableClassement from '@/components/TableClassement';
import { Badge, BoutonLien, Vide } from '@/components/ui';
import { getClassement, getCreneaux, getDerniersResultats, getEquipe, getJoueurs, getProchainsMatchs } from '@/lib/api';
import { competitionsEquipe, formatHeure, issue, JOURS, nomCompetition, recevant, visiteur } from '@/lib/format';
import { bilan, LIBELLE_SERIE } from '@/lib/stats';

export async function generateMetadata({ params }: PageProps<'/equipes/[id]'>): Promise<Metadata> {
  const equipe = await getEquipe((await params).id);
  if (!equipe) return { title: 'Équipe' };
  return {
    title: equipe.nom,
    description: `${equipe.nom} — ${equipe.championnat?.nom ?? equipe.categorie?.nom ?? 'AJSO Handball'} : effectif, calendrier, résultats et classement.`,
    openGraph: equipe.photo ? { images: [equipe.photo] } : undefined,
  };
}

const ANCRES = [['effectif', 'Effectif'], ['matchs', 'Matchs'], ['classement', 'Classement'], ['entrainements', 'Entraînements']] as const;

export default async function EquipePage({ params }: PageProps<'/equipes/[id]'>) {
  const { id } = await params;
  const equipe = await getEquipe(id);
  if (!equipe || !equipe.estAjso) notFound();

  const filtre = `&equipe=${equipe.id}`;
  const competitions = competitionsEquipe(equipe);
  const [prochains, resultats, creneaux, joueurs, ...parCompetition] = await Promise.all([
    getProchainsMatchs(filtre), getDerniersResultats(filtre), getCreneaux(`?equipe=${equipe.id}`),
    getJoueurs(equipe.id),
    ...competitions.map((c) => getClassement(c.id)),
  ]);
  // Classements publiés, la compétition la plus récente (dernière phase) en premier
  const classements = competitions.map((c, i) => ({ c, lignes: parCompetition[i] })).filter((x) => x.lignes.length).reverse();
  const classement = classements[0]?.lignes ?? [];

  const b = bilan(resultats);
  const nous = classement.find((l) => l.estAjso);
  const diff = b.butsPour - b.butsContre;
  const presentes = new Set([
    joueurs.length || equipe.entraineur ? 'effectif' : '',
    'matchs',
    classement.length ? 'classement' : '',
    creneaux.length ? 'entrainements' : '',
  ]);

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative bg-nuit text-white overflow-hidden motif-losanges">
        {equipe.photo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={equipe.photo} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <span aria-hidden className="absolute inset-0 bg-gradient-to-r from-nuit via-nuit/80 to-nuit/20" />
          </>
        ) : (
          <span aria-hidden className="absolute -right-24 top-1/2 -translate-y-1/2 w-[620px] aspect-square rotate-45 bg-losange opacity-50" />
        )}
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-nuit to-transparent" />

        <div className="relative max-w-[1400px] mx-auto px-4 md:px-10 pt-14 md:pt-20 pb-10">
          <Link href="/equipes" className="font-mono text-xs uppercase tracking-widest text-glacier hover:text-jaune">← Toutes les équipes</Link>
          <p className="font-mono text-xs tracking-[0.35em] uppercase text-jaune mt-8 mb-3">{equipe.categorie?.nom ?? 'Équipe'}</p>
          <h1 className="font-display text-6xl md:text-[9rem] uppercase leading-[0.95] pt-2">{equipe.nom}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-6">
            {competitions.map((c) => <Badge key={c.id} ton="jaune">{nomCompetition(c)}</Badge>)}
            {equipe.championnat && <span className="font-mono text-xs uppercase tracking-widest text-white/60">{equipe.championnat.niveau}</span>}
            {equipe.entente && <span className="font-mono text-xs uppercase tracking-widest border border-glacier/40 text-glacier px-2.5 py-1">Entente avec {equipe.entente}</span>}
            {nous && (
              <span className="font-display text-xl uppercase bg-white/10 px-3 py-1">
                {nous.position}<sup className="text-xs">{nous.position === 1 ? 'er' : 'e'}</sup> / {classement.length}
              </span>
            )}
          </div>
          {equipe.description && <p className="mt-6 max-w-2xl text-white/75 text-lg">{equipe.description}</p>}

          {/* Bandeau stats */}
          {b.joues > 0 && (
            <dl className="mt-12 grid grid-cols-3 md:grid-cols-6 border-t border-white/15">
              {[
                ['Matchs', b.joues, ''],
                ['Victoires', b.victoires, 'text-emerald-400'],
                ['Nuls', b.nuls, 'text-jaune'],
                ['Défaites', b.defaites, 'text-rose-400'],
                ['Diff. buts', `${diff > 0 ? '+' : ''}${diff}`, ''],
              ].map(([l, v, c]) => (
                <div key={l as string} className="py-5 pr-4 border-b md:border-b-0 border-white/10">
                  <dt className="font-mono text-[10px] uppercase tracking-widest text-white/50">{l}</dt>
                  <dd className={`font-display text-4xl md:text-5xl leading-none mt-1 ${c}`}>{v}</dd>
                </div>
              ))}
              <div className="py-5 col-span-3 md:col-span-1">
                <dt className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-2">Forme</dt>
                <dd><Forme forme={b.forme} /></dd>
              </div>
            </dl>
          )}
        </div>
      </section>

      {/* Navigation interne */}
      <nav className="sticky top-20 z-40 bg-white/95 backdrop-blur border-b border-nuit/10" aria-label="Sections de l'équipe">
        <div className="max-w-[1400px] mx-auto px-4 md:px-10 flex gap-6 overflow-x-auto">
          {ANCRES.filter(([a]) => presentes.has(a)).map(([a, l]) => (
            <a key={a} href={`#${a}`} className="py-4 font-display uppercase tracking-wide text-nuit/60 hover:text-violet whitespace-nowrap">{l}</a>
          ))}
        </div>
      </nav>

      {/* ===== PROCHAIN MATCH + SÉRIE ===== */}
      {(prochains[0] || b.serie) && (
        <section className="max-w-[1400px] mx-auto px-4 md:px-10 pt-14 grid lg:grid-cols-[1.4fr_1fr] gap-6">
          {prochains[0] ? <CarteMatch r={prochains[0]} /> : <div />}
          {b.serie && (
            <div className="bg-papier p-7 flex flex-col justify-center gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-violet">Série en cours</p>
                <p className="font-display text-4xl uppercase">
                  {b.serie.longueur} {LIBELLE_SERIE[b.serie.resultat][b.serie.longueur > 1 ? 1 : 0]}
                </p>
              </div>
              {b.record && (() => {
                const i = issue(b.record)!;
                return (
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-violet">Plus large victoire</p>
                    <p className="font-display text-xl uppercase">
                      {i.pour} – {i.contre} <span className="text-nuit/50">contre {(b.record.domicile ? visiteur : recevant)(b.record).nom}</span>
                    </p>
                  </div>
                );
              })()}
              <p className="text-sm text-nuit/50">{b.butsPour} buts marqués · {b.butsContre} encaissés · {b.joues ? (b.butsPour / b.joues).toFixed(1).replace('.', ',') : 0} par match</p>
            </div>
          )}
        </section>
      )}

      {/* ===== EFFECTIF ===== */}
      {presentes.has('effectif') && (
        <section id="effectif" className="max-w-[1400px] mx-auto px-4 md:px-10 py-16 scroll-mt-36">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <h2 className="font-display text-4xl md:text-6xl uppercase leading-none">Effectif</h2>
            {joueurs.length > 0 && <span className="font-mono text-xs text-nuit/40">{joueurs.length} joueur{joueurs.length > 1 ? 's' : ''}</span>}
          </div>
          {joueurs.length > 0 ? <Effectif joueurs={joueurs} /> : <Vide>L&apos;effectif sera bientôt présenté.</Vide>}
          {equipe.entraineur && (
            <div className="mt-10">
              <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-violet mb-4">Staff</h3>
              <div className="inline-flex items-center gap-4 bg-papier pr-8">
                <span className="w-16 h-16 bg-losange flex items-center justify-center font-display text-2xl text-white">
                  {equipe.entraineur.split(/\s+/).map((m) => m[0]).slice(0, 2).join('')}
                </span>
                <div>
                  <p className="font-display text-xl uppercase">{equipe.entraineur}</p>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-nuit/50">Entraîneur</p>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ===== MATCHS ===== */}
      <section id="matchs" className="bg-papier scroll-mt-36">
        <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-16 grid gap-14">
          <div>
            <h2 className="font-display text-3xl md:text-4xl uppercase mb-6">À venir</h2>
            {prochains.length === 0 ? <Vide>Aucun match programmé.</Vide> : (
              <div className="divide-y divide-nuit/10 border-y border-nuit/10 bg-white px-4">{prochains.map((r) => <LigneMatch key={r.id} r={r} />)}</div>
            )}
          </div>
          <div>
            <h2 className="font-display text-3xl md:text-4xl uppercase mb-6">Résultats</h2>
            {resultats.length === 0 ? <Vide>Pas encore de résultat.</Vide> : (
              <div className="divide-y divide-nuit/10 border-y border-nuit/10 bg-white px-4">{resultats.map((r) => <LigneMatch key={r.id} r={r} />)}</div>
            )}
          </div>
        </div>
      </section>

      {/* ===== CLASSEMENT + ENTRAÎNEMENTS ===== */}
      <section className={`max-w-[1400px] mx-auto px-4 md:px-10 py-16 grid gap-12 ${classement.length ? 'lg:grid-cols-[1.6fr_1fr]' : ''}`}>
        {classement.length > 0 ? (
          <div id="classement" className="scroll-mt-36 space-y-12">
            {classements.map(({ c, lignes }) => (
              <div key={c.id}>
                <h2 className="font-display text-3xl md:text-4xl uppercase mb-1">Classement</h2>
                <p className="text-sm text-nuit/50 mb-6">{nomCompetition(c)}</p>
                <TableClassement lignes={lignes} />
              </div>
            ))}
          </div>
        ) : null}
        <aside id="entrainements" className={`scroll-mt-36 grid gap-6 ${classement.length ? '' : 'md:grid-cols-2'}`}>
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
          <div className="bg-losange text-white p-7">
            <p className="font-display text-2xl uppercase mb-2">Rejoindre l&apos;équipe</p>
            <p className="text-white/80 text-sm mb-5">Deux séances d&apos;essai gratuites.</p>
            <BoutonLien href={`/contact?sujet=${encodeURIComponent(`Essai ${equipe.nom}`)}`}>Venir essayer</BoutonLien>
          </div>
        </aside>
      </section>
    </>
  );
}
