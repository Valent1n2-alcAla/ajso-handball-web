import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import Effectif from '@/components/Effectif';
import StatsJoueurs from '@/components/StatsJoueurs';
import Forme from '@/components/Forme';
import { CarteMatch, LigneMatch } from '@/components/Match';
import TableClassement from '@/components/TableClassement';
import { BoutonLien, Chevron, CONTENEUR, TitrePage, Vide } from '@/components/ui';
import Logo from '@/components/Logo';
import CarteConvocation from '@/components/Convocation';
import SelecteurSaison from '@/components/SelecteurSaison';
import { getClassement, getConvocationsAVenir, getCreneaux, getDatePremierMatch, getEquipe, getJoueurs, getParticipations, getProchainsMatchs, getResultatsSaison } from '@/lib/api';
import { libelleSaison, lireSaison, saisonCourante, saisonsDisponibles } from '@/lib/saison';
import { competitionsEquipe, formatHeure, issue, JOURS, nomCompetition, recevant, visiteur } from '@/lib/format';
import { bilan, LIBELLE_SERIE, statsJoueurs } from '@/lib/stats';
import ImageContenu from '@/components/ImageContenu';

export async function generateMetadata({ params }: PageProps<'/equipes/[id]'>): Promise<Metadata> {
  const equipe = await getEquipe((await params).id);
  if (!equipe) return { title: 'Équipe' };
  return {
    title: equipe.nom,
    description: `${equipe.nom} — ${equipe.championnat?.nom ?? equipe.categorie?.nom ?? 'AJSO Handball'} : effectif, calendrier, résultats et classement.`,
    openGraph: equipe.photo ? { images: [equipe.photo] } : undefined,
  };
}

const ANCRES = [
  ['presentation', 'Présentation'], ['convocations', 'Convocations'], ['effectif', 'Effectif et staff'], ['stats', 'Statistiques'],
  ['calendrier', 'Calendrier / Résultats'], ['classement', 'Classement'], ['entrainements', 'Entraînements'],
] as const;

/** Section de la fiche équipe (ancre du méga-menu). */
function Bloc({ id, titre, action, children }: { id: string; titre: ReactNode; action?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className={`${CONTENEUR} pt-10 scroll-mt-16`}>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 mb-5 border-b-2 border-bande pb-2">
        <h2 className="font-display text-[1.75rem] md:text-[2rem] uppercase leading-tight text-bande">{titre}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default async function EquipePage({ params, searchParams }: PageProps<'/equipes/[id]'>) {
  const { id } = await params;
  const sp = await searchParams;
  const equipe = await getEquipe(id);
  if (!equipe || !equipe.estAjso) notFound();

  const filtre = `&equipe=${equipe.id}`;
  const competitions = competitionsEquipe(equipe);
  const courante = saisonCourante();
  const saisons = saisonsDisponibles(courante, await getDatePremierMatch(filtre));
  const demandee = lireSaison(sp.saison);
  // Saison affichée pour les résultats, le bilan, la forme et les statistiques
  const saison = demandee && saisons.includes(demandee) ? demandee : courante;
  const archive = saison !== courante;
  const libelle = archive ? `Saison ${libelleSaison(saison)}` : 'Saison en cours';
  const [prochains, resultats, creneaux, joueurs, toutesParticipations, convocations, ...parCompetition] = await Promise.all([
    getProchainsMatchs(filtre), getResultatsSaison(saison, filtre), getCreneaux(`?equipe=${equipe.id}`),
    getJoueurs(equipe.id), getParticipations(equipe.id), getConvocationsAVenir(equipe.id),
    ...competitions.map((c) => getClassement(c.id)),
  ]);
  const matchsSaison = new Set(resultats.map((r) => r['@id'] ?? `/api/rencontres/${r.id}`));
  const participations = toutesParticipations.filter((p) => matchsSaison.has(p.rencontre));
  // Classements publiés, la compétition la plus récente (dernière phase) en premier
  const classements = competitions.map((c, i) => ({ c, lignes: parCompetition[i] })).filter((x) => x.lignes.length).reverse();
  const classement = classements[0]?.lignes ?? [];

  const b = bilan(resultats);
  const stats = statsJoueurs(participations);
  const matchsSaisis = new Set(participations.map((p) => p.rencontre)).size;
  const nous = classement.find((l) => l.estAjso);
  const diff = b.butsPour - b.butsContre;
  const presentes = new Set<string>(['presentation', 'effectif', 'calendrier', 'classement', convocations.length ? 'convocations' : '', stats.length ? 'stats' : '', creneaux.length ? 'entrainements' : '']);

  const fiche: [string, ReactNode][] = [
    ['Catégorie', equipe.categorie?.nom],
    ['Compétition', competitions.length ? competitions.map((c) => <span key={c.id} className="block">{nomCompetition(c)}</span>) : 'Pratique sans championnat'],
    ['Niveau', equipe.championnat?.niveau],
    ['Entraîneur', equipe.entraineur],
    ['Entente', equipe.entente ? `Avec ${equipe.entente}` : null],
    ['Classement', nous ? <>{nous.position}<sup>{nous.position === 1 ? 'er' : 'e'}</sup> sur {classement.length} · {nous.points} pts</> : null],
  ];

  return (
    <>
      <TitrePage titre={equipe.nom} retour={{ href: '/equipes', label: 'Toutes les équipes' }} />

      {/* Navigation interne */}
      <nav className={`${CONTENEUR} mt-5 sticky top-0 z-40`} aria-label="Sections de l'équipe">
        <ul className="rangee-defilante bg-bande flex overflow-x-auto">
          {ANCRES.filter(([a]) => presentes.has(a)).map(([a, l]) => (
            <li key={a} className="shrink-0">
              <a href={`#${a}`} className="block px-4 py-2.5 font-display uppercase text-[15px] text-white whitespace-nowrap hover:bg-bande-fonce">{l}</a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ===== PRÉSENTATION ===== */}
      <Bloc id="presentation" titre="Présentation">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <div>
            <div className="relative aspect-[16/9] bg-papier border border-filet overflow-hidden">
              {equipe.photo
                ? <ImageContenu src={equipe.photo} alt={`Photo de l'équipe ${equipe.nom}`} fill preload sizes="(min-width: 1170px) 620px, 100vw" className="object-cover" />
                : <span className="absolute inset-0 flex items-center justify-center opacity-30"><Logo size={170} decoratif /></span>}
            </div>
            {equipe.description && <p className="mt-4 text-[15px] leading-relaxed whitespace-pre-line">{equipe.description}</p>}
          </div>
          <div className="space-y-6">
            <table className="w-full text-[14px] border-t border-filet">
              <caption className="sr-only">Fiche de l&apos;équipe</caption>
              <tbody>
                {fiche.filter(([, v]) => v).map(([k, v]) => (
                  <tr key={k} className="border-b border-filet align-top">
                    <th scope="row" className="text-left font-display uppercase font-normal text-bande-fonce py-2 pr-4 w-32">{k}</th>
                    <td className="py-2">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {b.joues > 0 && (
              <div>
                <p className="font-display uppercase text-nuit mb-2">Bilan · {libelle}</p>
                <dl className="grid grid-cols-5 border border-filet text-center">
                  {[
                    ['Matchs', b.joues, ''],
                    ['Vict.', b.victoires, 'text-victoire'],
                    ['Nuls', b.nuls, ''],
                    ['Déf.', b.defaites, 'text-defaite'],
                    ['Diff.', `${diff > 0 ? '+' : ''}${diff}`, ''],
                  ].map(([l, v, c]) => (
                    <div key={l as string} className="py-2 border-r border-filet last:border-r-0">
                      <dt className="text-[12px] text-encre/75">{l}</dt>
                      <dd className={`font-display text-2xl leading-tight ${c}`}>{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-[14px]">
                  {b.forme.length > 0 && <span className="inline-flex items-center gap-2">Forme <Forme forme={b.forme} taille="sm" /></span>}
                  {b.serie && <span>Série : <strong>{b.serie.longueur} {LIBELLE_SERIE[b.serie.resultat][b.serie.longueur > 1 ? 1 : 0]}</strong></span>}
                  {b.record && (() => {
                    const i = issue(b.record)!;
                    return <span>Plus large victoire : <strong>{i.pour}-{i.contre}</strong> contre {(b.record.domicile ? visiteur : recevant)(b.record).nom}</span>;
                  })()}
                </div>
              </div>
            )}

            {prochains[0] && <CarteMatch r={prochains[0]} />}

            <div className="bg-papier border border-filet p-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[14px]"><strong className="font-display uppercase text-[17px] font-normal text-nuit block">Rejoindre l&apos;équipe</strong>Deux séances d&apos;essai gratuites.</p>
              <BoutonLien href={`/contact?sujet=${encodeURIComponent(`Essai ${equipe.nom}`)}`} taille="sm">Venir essayer<Chevron className="w-2 h-2.5" /></BoutonLien>
            </div>
          </div>
        </div>
      </Bloc>

      {/* ===== CONVOCATIONS ===== */}
      {convocations.length > 0 && (
        <Bloc id="convocations" titre="Convocations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {convocations.map((c) => <CarteConvocation key={c.id} c={c} />)}
          </div>
        </Bloc>
      )}

      {/* ===== EFFECTIF ===== */}
      <Bloc id="effectif" titre="Effectif et staff">
        {joueurs.length > 0 ? <Effectif joueurs={joueurs} stats={stats} /> : <Vide>L&apos;effectif sera bientôt présenté.</Vide>}
        {equipe.entraineur && (
          <div className="mt-8">
            <h3 className="font-display uppercase text-xl text-nuit mb-3">Staff</h3>
            <ul className="liste-chevrons space-y-1 text-[15px]">
              {equipe.entraineur.split(/\s*[/,&]\s*/).filter(Boolean).map((n) => <li key={n}><strong>{n}</strong> · Entraîneur</li>)}
            </ul>
          </div>
        )}
      </Bloc>

      {/* ===== STATS JOUEURS ===== */}
      {stats.length > 0 && (
        <Bloc id="stats" titre={archive ? `Statistiques · ${libelleSaison(saison)}` : 'Statistiques'}>
          <StatsJoueurs stats={stats} matchsEquipe={matchsSaisis} />
        </Bloc>
      )}

      {/* ===== CALENDRIER / RÉSULTATS ===== */}
      <Bloc
        id="calendrier"
        titre="Calendrier / Résultats"
        action={
          <a href={`/equipes/${equipe.id}/calendrier.ics`} className="inline-flex items-center gap-2 bg-bande text-white font-display uppercase text-[15px] px-3.5 py-1.5 hover:bg-bande-fonce" title="Calendrier iCal : Google Agenda, Apple Calendrier, Outlook…">
            <svg aria-hidden viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="5" width="18" height="16" /><path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5" /></svg>
            Ajouter à mon agenda
          </a>
        }
      >
        <h3 className="font-display uppercase text-xl text-nuit mb-2">À venir</h3>
        {prochains.length === 0 ? <Vide>Les prochaines rencontres de l&apos;équipe s&apos;afficheront ici.</Vide> : (
          <div className="divide-y divide-filet border-y border-filet">{prochains.map((r) => <LigneMatch key={r.id} r={r} />)}</div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-8 mb-2">
          <h3 className="font-display uppercase text-xl text-nuit">Résultats · {libelle}</h3>
          <SelecteurSaison saisons={saisons} active={saison} lien={(s) => `/equipes/${equipe.id}${s === courante ? '' : `?saison=${s}`}#calendrier`} className="max-w-full" />
        </div>
        {resultats.length === 0 ? <Vide>{archive ? `Aucun score enregistré pour la saison ${libelleSaison(saison)}.` : 'Les scores seront publiés après chaque match.'}</Vide> : (
          <div className="divide-y divide-filet border-y border-filet">{resultats.map((r) => <LigneMatch key={r.id} r={r} />)}</div>
        )}
      </Bloc>

      {/* ===== CLASSEMENT ===== */}
      <Bloc id="classement" titre="Classement">
        {classements.length === 0 ? (
          <Vide>{competitions.length ? 'Le classement apparaîtra après les premières journées.' : "L'équipe ne dispute pas de championnat."}</Vide>
        ) : (
          <div className="space-y-10">
            {classements.map(({ c, lignes }) => (
              <div key={c.id}>
                <p className="text-[14px] text-encre/80 mb-3"><strong className="text-nuit">{nomCompetition(c)}</strong>{c.niveau ? ` · ${c.niveau}` : ''}</p>
                <TableClassement lignes={lignes} legende={`Classement ${nomCompetition(c)}`} />
              </div>
            ))}
          </div>
        )}
      </Bloc>

      {/* ===== ENTRAÎNEMENTS ===== */}
      {creneaux.length > 0 && (
        <Bloc id="entrainements" titre="Entraînements">
          <ul className="liste-chevrons space-y-1.5 text-[15px]">
            {creneaux.map((c) => (
              <li key={c.id}><strong>{JOURS[c.jour]}</strong> de {formatHeure(c.heureDebut)} à {formatHeure(c.heureFin)} · {c.gymnase.nom}</li>
            ))}
          </ul>
        </Bloc>
      )}
    </>
  );
}
