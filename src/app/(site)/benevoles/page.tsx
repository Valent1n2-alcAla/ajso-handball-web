import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, BoutonLien, Chevron, Section, TitrePage, Vide } from '@/components/ui';
import { getPermanencesAVenir, getProchainsMatchs } from '@/lib/api';
import { etatPermanence, parWeekEnd, ROLES_PERMANENCE, trierPermanences } from '@/lib/benevoles';
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
      <TitrePage titre="Bénévoles">
        Arbitrage, table de marque, buvette, accueil : chaque match à domicile a besoin de quelques bras.
      </TitrePage>

      <Section>
        {matchs.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-5 mb-8 bg-papier p-5 border-l-4 border-bande">
            <div>
              <p className="text-[13px] font-semibold text-bande-fonce">Prochains matchs à domicile</p>
              <p className="font-display text-2xl md:text-3xl uppercase leading-tight text-nuit">
                {aPourvoir > 0 ? <>{aPourvoir} poste{aPourvoir > 1 ? 's' : ''} à pourvoir</> : 'Tous les postes sont pourvus'}
              </p>
            </div>
            <BoutonLien href="/contact?sujet=B%C3%A9n%C3%A9volat">Je me propose<Chevron className="w-2 h-2.5" /></BoutonLien>
          </div>
        )}

        {matchs.length === 0 ? (
          <Vide titre="Aucun match à domicile programmé" action={{ href: '/calendrier', label: 'Voir le calendrier' }}>
            Les besoins en bénévoles seront affichés ici dès que les prochains matchs à domicile seront programmés.
          </Vide>
        ) : (
          <div className="space-y-10">
            {groupes.map(([samedi, liste]) => {
              const manquants = liste.reduce((n, m) => n + m.permanences.reduce((k, p) => k + etatPermanence(p).manquants, 0), 0);
              return (
                <div key={samedi}>
                  <h2 className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-display text-2xl uppercase text-bande border-b-2 border-bande pb-1 mb-4">
                    {libelleGroupe(samedi, liste.map((m) => m.r.date))}
                    {manquants > 0 && <span className="font-body normal-case text-[13px] font-semibold text-encre whitespace-nowrap">{manquants} à pourvoir</span>}
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {liste.map(({ r, permanences: perms }) => (
                      <article key={r.id} className="border border-filet border-t-4 border-t-bande flex flex-col">
                        <header className="px-4 pt-3 pb-3 border-b border-filet">
                          <p className="text-[13px]">
                            <span className="capitalize font-semibold">{formatDateMatch(r)}</span> · <span className="text-bande-fonce font-semibold">{formatHoraire(r)}</span>
                          </p>
                          <h3 className="font-display text-xl uppercase leading-tight text-nuit mt-0.5">
                            <Link href={`/equipes/${r.equipe.id}`} className="hover:underline">AJSO {r.equipe.nom}</Link>
                            <span className="text-encre/60 normal-case"> contre </span>{r.equipeAdverse.nom}
                          </h3>
                          {r.lieu && <p className="text-[13px] text-encre/80 mt-0.5">{r.lieu}</p>}
                        </header>
                        {perms.length === 0 ? (
                          <p className="px-4 py-4 text-[14px]">
                            Besoins à préciser.{' '}
                            <Link href={sujet(r)} className="text-bande-fonce font-semibold hover:underline">Proposer mon aide</Link>
                          </p>
                        ) : (
                          <ul className="divide-y divide-filet">
                            {trierPermanences(perms).map((p) => {
                              const { noms, manquants: m } = etatPermanence(p);
                              const role = ROLES_PERMANENCE[p.role] ?? p.role;
                              return (
                                <li key={p.id} className="px-4 py-2.5 grid grid-cols-1 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-x-4 gap-y-2 sm:items-center">
                                  <p className="font-display uppercase text-nuit">{role}</p>
                                  <div className="flex flex-wrap items-center gap-2">
                                    {noms.map((n) => (
                                      <span key={n} className="inline-flex items-center gap-1.5 border border-victoire text-victoire font-semibold text-[13px] px-2 py-0.5">
                                        <span aria-hidden>✓</span>{n}
                                      </span>
                                    ))}
                                    {m > 0 && (
                                      <Link href={sujet(r, role)} className="group inline-flex items-center gap-2 whitespace-nowrap" title="Se proposer pour ce poste">
                                        <Badge ton="jaune">À pourvoir{m > 1 ? ` × ${m}` : ''}</Badge>
                                        <span className="text-[13px] text-bande-fonce font-semibold group-hover:underline">Je me propose</span>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-bande text-white p-6">
          <div>
            <h2 className="font-display text-2xl uppercase">Envie de donner un coup de main&nbsp;?</h2>
            <p className="text-[14.5px] mt-1 max-w-xl">Parents, licenciés, supporters : écrivez-nous en précisant le match et le poste qui vous intéressent, le bureau vous recontacte.</p>
          </div>
          <div className="shrink-0"><BoutonLien href="/contact?sujet=B%C3%A9n%C3%A9volat" variante="nuit">Devenir bénévole</BoutonLien></div>
        </div>
      </Section>
    </>
  );
}
