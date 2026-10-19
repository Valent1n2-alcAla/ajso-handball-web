import Link from 'next/link';
import Logo from '@/components/Logo';
import { CarteEvenement } from '@/components/Evenement';
import { BandeauResultats, CarteMatch, CarteResultat, LigneMatch } from '@/components/Match';
import { BoutonLien, LienFleche, Section, Surtitre, Vide } from '@/components/ui';
import { getActualites, getClub, getDerniersResultats, getEquipesClub, getEvenements, getProchainsMatchs } from '@/lib/api';
import { formatPeriode, TYPES_EVENEMENT } from '@/lib/format';
import { CarteActu } from '@/components/Actualite';
import { couleurTranche, styleCategorie } from '@/lib/categories';

export default async function Accueil() {
  const [equipes, prochains, resultats, actus, evenements, club] = await Promise.all([
    getEquipesClub(), getProchainsMatchs(), getDerniersResultats(), getActualites(), getEvenements('avenir'), getClub(),
  ]);
  const prochainMatch = prochains[0];
  const dernierResultat = resultats[0];
  const prochainEvenement = evenements[0];
  const tranches = [...new Set(equipes.map((e) => e.categorie?.tranche?.nom).filter((t): t is string => !!t))];

  return (
    <>
      <BandeauResultats resultats={resultats} />

      {/* ===== HERO ===== */}
      <section className="relative bg-nuit text-white overflow-hidden motif-losanges">
        <div aria-hidden className="absolute -right-[30%] md:-right-[8%] top-[42%] -translate-y-1/2 w-[110vw] md:w-[62vw] max-w-[820px] aspect-square rotate-45 bg-losange opacity-70" />
        <div aria-hidden className="absolute -right-[30%] md:-right-[8%] top-[42%] -translate-y-1/2 w-[110vw] md:w-[62vw] max-w-[820px] aspect-square rotate-45 border-[10px] border-glacier/25 scale-[1.08]" />
        <div aria-hidden className="absolute right-[6%] top-20 w-5 h-5 rotate-45 bg-jaune hidden lg:block" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-nuit to-transparent" />

        <div className="relative max-w-[1400px] mx-auto px-4 md:px-10 pt-14 pb-44 md:pt-24 md:pb-60 grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] items-center gap-10">
          <div className="animate-apparition">
            <Surtitre className="text-jaune mb-6">AJS Ouistreham Handball</Surtitre>
            <h1 className="font-display text-[19vw] sm:text-[15vw] lg:text-[8.2rem] xl:text-[9.5rem] leading-[0.86] uppercase">
              Fiers d&apos;être<br />
              <span className="text-degrade pr-2">les Ratons.</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl mt-8 max-w-lg">
              Du Baby Hand aux Seniors, toutes les équipes, tous les matchs et tous les résultats du club de Ouistreham Riva-Bella.
            </p>
            <div className="flex flex-wrap gap-3 mt-10">
              <BoutonLien href="/inscriptions">Rejoindre le club</BoutonLien>
              <BoutonLien href="/calendrier" variante="contour">Calendrier</BoutonLien>
            </div>
            <dl className="flex flex-wrap gap-x-10 gap-y-5 mt-12 pt-8 border-t border-white/15 max-w-xl">
              {equipes.length > 0 && (
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-glacier">Équipes engagées</dt>
                  <dd className="font-display text-5xl leading-none mt-1">{equipes.length}</dd>
                </div>
              )}
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-glacier">Dès</dt>
                <dd className="font-display text-5xl leading-none mt-1">3 ans</dd>
              </div>
              {club?.label && (
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-glacier">Label</dt>
                  <dd className="font-display text-2xl uppercase leading-tight mt-2 text-jaune max-w-[12rem]">{club.label}</dd>
                </div>
              )}
            </dl>
          </div>
          <div className="hidden lg:flex justify-center animate-apparition delai-2">
            <Logo size={400} prioritaire className="drop-shadow-[0_40px_60px_rgba(0,0,0,0.55)]" />
          </div>
        </div>
      </section>

      {/* ===== À LA UNE : prochain match, dernier résultat, prochain rendez-vous ===== */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-10 -mt-28 md:-mt-36">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr] gap-4 md:gap-5">
          <div className="animate-apparition delai-1">
            {prochainMatch ? (
              <CarteMatch r={prochainMatch} />
            ) : (
              <CarteVide titre="Prochain match" texte="Aucun match programmé pour l'instant. Le calendrier se remplit au fil de la saison." lien={{ href: '/calendrier', label: 'Voir le calendrier' }} />
            )}
          </div>
          <div className="animate-apparition delai-2">
            {dernierResultat ? (
              <div className="h-full flex flex-col shadow-2xl shadow-nuit/30">
                <p className="bg-roi text-white font-display text-sm tracking-wider uppercase px-5 py-3">Dernier résultat</p>
                <div className="flex-1"><CarteResultat r={dernierResultat} /></div>
              </div>
            ) : (
              <CarteVide titre="Dernier résultat" texte="Les scores s'afficheront ici dès les premiers matchs joués." lien={{ href: '/equipes', label: 'Découvrir les équipes' }} />
            )}
          </div>
          <div className="md:col-span-2 lg:col-span-1 animate-apparition delai-3">
            {prochainEvenement ? (
              <Link href="/agenda" className="group h-full flex flex-col bg-losange text-white p-6 shadow-2xl shadow-nuit/30 relative overflow-hidden">
                <span aria-hidden className="absolute -right-10 -bottom-10 w-40 h-40 rotate-45 border-2 border-white/15 transition-transform duration-500 group-hover:rotate-[60deg]" />
                <span className="font-display text-sm tracking-wider uppercase text-jaune">Prochain rendez-vous</span>
                <span className="font-mono text-[11px] uppercase tracking-widest text-white/80 mt-4">{TYPES_EVENEMENT[prochainEvenement.type] ?? 'Événement'}</span>
                <span className="font-display text-3xl uppercase leading-tight mt-1">{prochainEvenement.titre}</span>
                <span className="font-mono text-sm mt-3 capitalize text-glacier">{formatPeriode(prochainEvenement.debut, prochainEvenement.fin)}</span>
                {prochainEvenement.lieu && <span className="text-sm text-white/80 mt-1">{prochainEvenement.lieu}</span>}
                <span className="mt-auto pt-6 font-display uppercase tracking-wide">Tout l&apos;agenda <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1">→</span></span>
              </Link>
            ) : (
              <Link href="/entrainements" className="group h-full flex flex-col bg-losange text-white p-6 shadow-2xl shadow-nuit/30">
                <span className="font-display text-sm tracking-wider uppercase text-jaune">Venir essayer</span>
                <span className="font-display text-3xl uppercase leading-tight mt-4">Deux séances d&apos;essai gratuites</span>
                <span className="mt-auto pt-6 font-display uppercase tracking-wide">Voir les horaires <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1">→</span></span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ===== RÉSULTATS (la carte « dernier résultat » ci-dessus tient lieu d'état vide) ===== */}
      {resultats.length > 0 ? (
        <Section surtitre="Saison en cours" titre="Derniers résultats" action={{ href: '/calendrier?vue=resultats', label: 'Tous les résultats' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {resultats.slice(0, 4).map((r) => <CarteResultat key={r.id} r={r} />)}
          </div>
        </Section>
      ) : (
        <div aria-hidden className="h-16 md:h-24" />
      )}

      {/* ===== À VENIR ===== */}
      <section className="relative bg-nuit text-white motif-losanges overflow-hidden">
        <div aria-hidden className="absolute -left-40 top-1/2 -translate-y-1/2 w-96 aspect-square rotate-45 bg-losange opacity-25" />
        <Section sombre surtitre="Agenda sportif" titre={<>À <span className="text-jaune">venir</span></>} action={{ href: '/calendrier', label: 'Calendrier complet' }} className="relative">
          {prochains.length === 0 ? (
            <Vide sombre titre="Pas de match programmé">Les prochaines rencontres seront annoncées ici.</Vide>
          ) : (
            <div className="divide-y divide-white/10 border-y border-white/10">
              {prochains.slice(0, 5).map((r) => <LigneMatch key={r.id} r={r} sombre />)}
            </div>
          )}
        </Section>
      </section>

      {/* ===== ÉQUIPES ===== */}
      <section className="bg-papier">
        <Section surtitre="Du Baby Hand aux Seniors" titre="Nos équipes" action={{ href: '/equipes', label: `Les ${equipes.length} équipes` }}>
          {tranches.length > 0 && (
            <ul className="flex flex-wrap gap-x-6 gap-y-2 -mt-4 mb-8 font-mono text-[11px] uppercase tracking-widest text-nuit/70">
              {tranches.map((t) => (
                <li key={t} className="flex items-center gap-2"><span aria-hidden className="w-2.5 h-2.5 rotate-45" style={{ background: couleurTranche(t).fond }} />{t}</li>
              ))}
            </ul>
          )}
          {equipes.length === 0 ? (
            <Vide>Les équipes seront affichées ici.</Vide>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {equipes.map((e) => (
                <Link
                  key={e.id}
                  href={`/equipes/${e.id}`}
                  style={styleCategorie(e)}
                  className="group relative bg-white hover:bg-nuit transition-colors duration-300 p-4 md:p-6 overflow-hidden min-h-[132px] md:min-h-[170px] flex flex-col shadow-sm hover:shadow-xl hover:shadow-nuit/20"
                >
                  <span aria-hidden className="absolute top-0 left-0 right-0 h-1 bg-(--cat)" />
                  <span aria-hidden className="absolute -right-8 -bottom-8 w-24 h-24 md:w-28 md:h-28 rotate-45 bg-(--cat) opacity-10 group-hover:opacity-100 group-hover:-right-6 group-hover:-bottom-6 transition-all duration-500" />
                  <span className="relative font-mono text-[10px] md:text-[11px] uppercase tracking-widest text-nuit/60 group-hover:text-glacier">{e.categorie?.nom}</span>
                  <p className="relative font-display text-xl md:text-3xl uppercase leading-[1.12] mt-2 group-hover:text-white transition-colors">{e.nom}</p>
                  <p className="relative mt-auto pt-3 text-xs md:text-sm text-nuit/60 group-hover:text-white/75 line-clamp-2 pr-6">{e.championnat?.nom ?? 'Pratique sans championnat'}</p>
                </Link>
              ))}
            </div>
          )}
        </Section>
      </section>

      {/* ===== AGENDA ===== */}
      {evenements.length > 0 && (
        <Section surtitre="Vie du club" titre="Agenda" action={{ href: '/agenda', label: 'Tout l\'agenda' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {evenements.slice(0, 2).map((e) => <CarteEvenement key={e.id} e={e} />)}
          </div>
        </Section>
      )}

      {/* ===== ACTUS ===== */}
      <section className={evenements.length > 0 ? 'bg-papier' : ''}>
        <Section surtitre="La vie du club" titre="Actualités" action={{ href: '/actualites', label: 'Toutes les actus' }}>
          {actus.length === 0 ? (
            <Vide>Les articles du club seront affichés ici.</Vide>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {actus.slice(0, 3).map((a, i) => <CarteActu key={a.id} a={a} i={i} />)}
            </div>
          )}
        </Section>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative bg-losange text-white overflow-hidden">
        <div aria-hidden className="absolute -right-24 top-1/2 -translate-y-1/2 w-[420px] aspect-square rotate-45 border-[16px] border-white/10" />
        <div aria-hidden className="absolute right-40 -top-16 w-32 aspect-square rotate-45 bg-jaune/90 hidden md:block" />
        <div className="relative max-w-[1400px] mx-auto px-4 md:px-10 py-16 md:py-24 grid grid-cols-1 md:grid-cols-[1fr_auto] md:items-center gap-8">
          <div>
            <Surtitre className="text-jaune mb-4">Saison en cours</Surtitre>
            <h2 className="font-display text-5xl md:text-7xl uppercase leading-[1.02]">Viens essayer<br />le hand&nbsp;!</h2>
            <p className="text-white/85 mt-5 max-w-xl text-lg">Séances d&apos;essai gratuites, toutes catégories, filles et garçons dès 3 ans.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <BoutonLien href="/inscriptions">Inscriptions</BoutonLien>
            <BoutonLien href="/entrainements" variante="contour">Horaires</BoutonLien>
          </div>
        </div>
      </section>
    </>
  );
}

/** Carte de la rangée « à la une » quand il n'y a pas encore de donnée. */
function CarteVide({ titre, texte, lien }: { titre: string; texte: string; lien: { href: string; label: string } }) {
  return (
    <div className="h-full bg-white shadow-2xl shadow-nuit/30 flex flex-col">
      <p className="bg-roi text-white font-display text-sm tracking-wider uppercase px-5 py-3">{titre}</p>
      <div className="flex-1 p-6 flex flex-col gap-4">
        <div aria-hidden className="relative w-12 h-12">
          <span className="absolute inset-0 rotate-45 border-2 border-nuit/10" />
          <span className="absolute inset-3 rotate-45 bg-losange" />
        </div>
        <p className="text-nuit/70">{texte}</p>
        <div className="mt-auto"><LienFleche href={lien.href}>{lien.label}</LienFleche></div>
      </div>
    </div>
  );
}

