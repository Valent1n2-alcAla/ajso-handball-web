import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, BoutonLien, PageHero, Section, Vide } from '@/components/ui';
import { getPermanencesAVenir, getProchainsMatchs } from '@/lib/api';
import { etatPermanence, parWeekEnd, ROLES_PERMANENCE, trierPermanences } from '@/lib/benevoles';
import { styleCategorie } from '@/lib/categories';
import { formatDateCourte, formatDateMatch, formatHoraire, formatWeekEnd, parseDate } from '@/lib/format';
import type { Permanence, RencontreResume } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Bénévoles',
  description: "Arbitrage, table de marque, buvette, accueil : les postes de bénévoles à pourvoir lors des matchs à domicile de l'AJS Ouistreham Handball.",
};

type MatchPermanences = { r: RencontreResume; permanences: Permanence[] };

/** « Week-end du 24-25 oct. », ou « Semaine du 19 oct. » si un match a lieu en semaine. */
function libelleGroupe(samedi: string, dates: string[]): string {
  const enSemaine = dates.some((d) => ![0, 6].includes(parseDate(d).getUTCDay()));
  if (!enSemaine) return formatWeekEnd(samedi);
  const lundi = new Date(parseDate(samedi).getTime() - 5 * 86400000).toISOString().slice(0, 10);
  return `Semaine du ${formatDateCourte(lundi)}`;
}

const sujet = (r: RencontreResume, role?: string) =>
  `/contact?sujet=${encodeURIComponent(`Bénévolat – ${formatDateCourte(r.date)} ${r.equipe.nom}${role ? ` – ${role}` : ''}`)}`;

export default async function BenevolesPage() {
  const [matchsDomicile, permanences] = await Promise.all([getProchainsMatchs('&domicile=true'), getPermanencesAVenir()]);

  // Matchs à domicile à venir, plus ceux qui ont des permanences (même si le match n'est plus « à venir » faute de score)
  const parMatch = new Map<number, MatchPermanences>();
  for (const r of matchsDomicile) parMatch.set(r.id, { r, permanences: [] });
  for (const p of permanences) {
    const m = parMatch.get(p.rencontre.id) ?? { r: p.rencontre, permanences: [] };
    m.permanences.push(p);
    parMatch.set(p.rencontre.id, m);
  }
  const matchs = [...parMatch.values()].sort((a, b) => a.r.date.localeCompare(b.r.date) || (a.r.heure ?? '').localeCompare(b.r.heure ?? ''));
  const groupes = parWeekEnd(matchs, (m) => m.r.date);
  const aPourvoir = permanences.reduce((n, p) => n + etatPermanence(p).manquants, 0);

  return (
    <>
      <PageHero surtitre="Vie du club" titre={<>Bénévoles <span className="text-jaune">à vos postes</span></>}>
        Arbitrage, table de marque, buvette, accueil : chaque match à domicile a besoin de quelques bras.
      </PageHero>

      <Section>
        {matchs.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-6 mb-12 bg-papier p-6 md:p-8 border-l-4 border-jaune">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-violet">Prochains matchs à domicile</p>
              <p className="font-display text-4xl md:text-5xl uppercase leading-none mt-2">
                {aPourvoir > 0 ? <>{aPourvoir} poste{aPourvoir > 1 ? 's' : ''} à pourvoir</> : 'Tous les postes sont pourvus'}
              </p>
            </div>
            <BoutonLien href="/contact?sujet=B%C3%A9n%C3%A9volat" variante="nuit">Je me propose</BoutonLien>
          </div>
        )}

        {matchs.length === 0 ? (
          <Vide titre="Aucun match à domicile programmé" action={{ href: '/calendrier', label: 'Voir le calendrier' }}>
            Les besoins en bénévoles seront affichés ici dès que les prochains matchs à domicile seront programmés.
          </Vide>
        ) : (
          <div className="space-y-14">
            {groupes.map(([samedi, liste]) => {
              const manquants = liste.reduce((n, m) => n + m.permanences.reduce((k, p) => k + etatPermanence(p).manquants, 0), 0);
              return (
                <div key={samedi}>
                  <h2 className="flex flex-wrap items-center gap-x-4 gap-y-1 font-display text-[1.7rem] md:text-4xl uppercase mb-5">
                    <span aria-hidden className="w-3 h-3 rotate-45 bg-jaune shrink-0" />
                    {libelleGroupe(samedi, liste.map((m) => m.r.date))}
                    <span aria-hidden className="hidden sm:block flex-1 h-px bg-nuit/10" />
                    {manquants > 0 && <span className="font-mono text-xs tracking-widest text-violet whitespace-nowrap">{manquants} à pourvoir</span>}
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {liste.map(({ r, permanences: perms }) => (
                      <article key={r.id} className="bg-white ring-1 ring-nuit/10 shadow-sm flex flex-col" style={styleCategorie(r.equipe)}>
                        <span aria-hidden className="h-1.5 bg-(--cat)" />
                        <header className="px-5 md:px-6 pt-5 pb-4 border-b border-nuit/10">
                          <p className="font-mono text-xs text-nuit/60">
                            <span className="capitalize font-semibold text-nuit">{formatDateMatch(r)}</span> · <span className="text-roi font-semibold">{formatHoraire(r)}</span>
                          </p>
                          <h3 className="font-display text-2xl uppercase leading-tight mt-1">
                            <Link href={`/equipes/${r.equipe.id}`} className="hover:text-violet">AJSO {r.equipe.nom}</Link>
                            <span className="text-nuit/30"> vs </span>{r.equipeAdverse.nom}
                          </h3>
                          {r.lieu && <p className="text-sm text-nuit/60 mt-1">{r.lieu}</p>}
                        </header>
                        {perms.length === 0 ? (
                          <p className="px-5 md:px-6 py-5 text-sm text-nuit/60">
                            Besoins à préciser.{' '}
                            <Link href={sujet(r)} className="text-roi font-semibold hover:underline">Proposer mon aide →</Link>
                          </p>
                        ) : (
                          <ul className="divide-y divide-nuit/5">
                            {trierPermanences(perms).map((p) => {
                              const { noms, manquants: m } = etatPermanence(p);
                              const role = ROLES_PERMANENCE[p.role] ?? p.role;
                              return (
                                <li key={p.id} className="px-5 md:px-6 py-3.5 grid grid-cols-1 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-x-4 gap-y-2 sm:items-center">
                                  <p className="font-display uppercase tracking-wide">{role}</p>
                                  <div className="flex flex-wrap items-center gap-2">
                                    {noms.map((n) => (
                                      <span key={n} className="inline-flex items-center gap-1.5 bg-victoire/10 text-victoire font-semibold text-sm px-2.5 py-1">
                                        <span aria-hidden>✓</span>{n}
                                      </span>
                                    ))}
                                    {m > 0 && (
                                      <Link href={sujet(r, role)} className="group inline-flex items-center gap-2 whitespace-nowrap" title="Se proposer pour ce poste">
                                        <Badge ton="jaune">À pourvoir{m > 1 ? ` × ${m}` : ''}</Badge>
                                        <span className="text-sm text-roi font-semibold group-hover:underline">Je me propose</span>
                                      </Link>
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <Section className="pt-0 md:pt-0">
        <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 bg-losange text-white p-8 md:p-10">
          <span aria-hidden className="absolute -right-12 -top-12 w-48 aspect-square rotate-45 border-[14px] border-white/10" />
          <div className="relative">
            <h2 className="font-display text-4xl uppercase">Envie de donner un coup de main&nbsp;?</h2>
            <p className="text-white/85 mt-2 max-w-xl">Parents, licenciés, supporters : écrivez-nous en précisant le match et le poste qui vous intéressent, le bureau vous recontacte.</p>
          </div>
          <div className="relative shrink-0"><BoutonLien href="/contact?sujet=B%C3%A9n%C3%A9volat">Devenir bénévole</BoutonLien></div>
        </div>
      </Section>
    </>
  );
}
