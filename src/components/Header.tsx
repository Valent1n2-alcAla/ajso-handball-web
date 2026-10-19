'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type FocusEvent } from 'react';
import Logo from './Logo';
import BoutonsReseaux from './Reseaux';
import BannierePartenaires from './BannierePartenaires';
import { Chevron, CONTENEUR } from './ui';
import type { ColonneMenu, Reseau, RubriqueNav } from '@/lib/site';
import type { Partenaire } from '@/lib/types';

const RECHERCHE = 'Recherche';

function IconeLoupe({ className = 'w-[18px] h-[18px]' }: { className?: string }) {
  return <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.6"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L21 21" /></svg>;
}

/** Formulaire de recherche dans les actualités (GET /actualites?q=). */
function FormulaireRecherche({ id, onEnvoi }: { id: string; onEnvoi: () => void }) {
  return (
    <form action="/actualites" role="search" className="flex w-full max-w-xl" onSubmit={onEnvoi}>
      <label htmlFor={id} className="sr-only">Rechercher dans les actualités</label>
      <input id={id} name="q" type="search" required maxLength={100} placeholder="Rechercher dans les actualités…"
        className="flex-1 min-w-0 bg-white text-nuit px-3 py-2 text-[15px] border-2 border-white focus:border-nuit outline-none" />
      <button type="submit" className="bg-nuit text-white font-display uppercase px-4 hover:bg-bande-fonce">OK</button>
    </form>
  );
}

/** Colonne du méga-menu : titre de l'équipe (ou tranche d'âge) puis liens à chevrons. */
function Colonne({ c, fermer }: { c: ColonneMenu; fermer: () => void }) {
  const groupe = c.equipes.length > 1 || c.titre !== c.equipes[0]?.titre;
  return (
    <div className="min-w-0">
      {groupe && <p className="font-display uppercase text-lg text-white border-b-2 border-nuit pb-1 mb-3">{c.titre}</p>}
      <div className="space-y-4">
        {c.equipes.map((e) => (
          <div key={e.href}>
            <Link href={e.href} onClick={fermer} className={`font-display uppercase text-white hover:underline ${groupe ? 'text-[15px]' : 'text-lg block border-b-2 border-nuit pb-1 mb-3'}`}>{e.titre}</Link>
            <ul className={groupe ? 'mt-1 space-y-0.5' : 'space-y-1'}>
              {e.liens.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={fermer} className="inline-flex items-center gap-2 text-[14px] text-white hover:underline py-0.5">
                    <Chevron className="w-1.5 h-2.5" />{l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Header({ rubriques, reseaux, partenaires, email }: {
  rubriques: RubriqueNav[]; reseaux: Reseau[]; partenaires: Partenaire[]; email?: string | null;
}) {
  const pathname = usePathname();
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [deplie, setDeplie] = useState<string | null>(null);
  const declencheurs = useRef<Record<string, HTMLButtonElement | null>>({});
  const refNav = useRef<HTMLElement>(null);
  const minuteur = useRef<number | undefined>(undefined);

  const actif = (r: RubriqueNav) =>
    r.type === 'lien'
      ? pathname === r.href || pathname.startsWith(`${r.href}/`)
      : r.actifs.some((h) => pathname === h || pathname.startsWith(`${h}/`));

  const fermer = () => { setOuvert(null); setMobile(false); setDeplie(null); };

  // Échap ferme le panneau (le focus revient sur son bouton) ; clic extérieur aussi
  useEffect(() => {
    if (!ouvert) return;
    const touche = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOuvert(null);
      declencheurs.current[ouvert]?.focus();
    };
    const clic = (e: MouseEvent) => { if (!refNav.current?.contains(e.target as Node)) setOuvert(null); };
    document.addEventListener('keydown', touche);
    document.addEventListener('mousedown', clic);
    return () => { document.removeEventListener('keydown', touche); document.removeEventListener('mousedown', clic); };
  }, [ouvert]);

  // Menu mobile : Échap le ferme
  useEffect(() => {
    if (!mobile) return;
    const touche = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobile(false); };
    document.addEventListener('keydown', touche);
    return () => document.removeEventListener('keydown', touche);
  }, [mobile]);

  useEffect(() => () => window.clearTimeout(minuteur.current), []);

  // Survol (souris) : ouverture immédiate, fermeture légèrement différée pour traverser l'espace vers le panneau
  const survol = (label: string | null) => {
    window.clearTimeout(minuteur.current);
    if (label) setOuvert(label);
    else minuteur.current = window.setTimeout(() => setOuvert(null), 150);
  };
  // Le focus quitte la rubrique (Tab) : panneau refermé
  const sortie = (e: FocusEvent<HTMLLIElement>, label: string) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOuvert((o) => (o === label ? null : o));
  };

  const onglet = (estActif: boolean, estOuvert: boolean) =>
    `relative flex items-center gap-1.5 h-full px-1 font-display uppercase text-[15px] xl:text-base tracking-wide text-white whitespace-nowrap after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-1 after:z-10 ${estActif || estOuvert ? 'after:bg-nuit' : 'after:bg-transparent hover:after:bg-nuit'}`;

  return (
    <header id="haut" className="relative z-50">
      {/* Bande supérieure : réseaux sociaux */}
      <div className="hidden lg:block bg-bande pt-4">
        <div className="bg-white">
          <div className={`${CONTENEUR} flex items-stretch h-9`}>
            {reseaux.length > 0 && (
              <>
                <p className="bg-bande text-white font-display uppercase text-sm tracking-wide px-6 flex items-center">Suivez-nous</p>
                <BoutonsReseaux reseaux={reseaux} taille="sm" />
              </>
            )}
            {email && (
              <a href={`mailto:${email}`} className="ml-auto self-center text-[13px] text-encre hover:text-bande-fonce hover:underline">{email}</a>
            )}
          </div>
        </div>
      </div>

      <div className="bg-bande text-white border-b-4 border-white">
        <div className={`${CONTENEUR} flex items-center justify-between gap-6 py-3 lg:py-7`}>
          <Link href="/" onClick={fermer} className="flex items-center gap-3 lg:gap-4 min-w-0" aria-label="AJS Ouistreham Handball, accueil">
            <span className="shrink-0 w-14 h-14 lg:w-[92px] lg:h-[92px] rounded-full bg-white flex items-center justify-center border-2 lg:border-[3px] border-nuit">
              <Logo size={66} prioritaire decoratif className="w-[72%] h-auto" />
            </span>
            <span className="min-w-0 leading-none" aria-hidden>
              <span className="block font-display font-bold uppercase text-nuit text-[1.2rem] sm:text-[1.45rem] lg:text-[2.05rem] tracking-tight">AJS Ouistreham Handball</span>
              <span className="block font-display uppercase text-white text-sm lg:text-[1.4rem] mt-0.5 lg:mt-1 font-normal">Site officiel</span>
            </span>
          </Link>

          <div className="hidden lg:flex flex-1 justify-end">
            <BannierePartenaires partenaires={partenaires} />
          </div>

          <button
            type="button"
            className="lg:hidden shrink-0 w-11 h-11 flex flex-col items-center justify-center gap-[5px] bg-nuit"
            aria-expanded={mobile}
            aria-controls="menu-mobile"
            aria-label={mobile ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={() => setMobile((o) => !o)}
          >
            <span className={`block w-6 h-0.5 bg-white transition-transform ${mobile ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white ${mobile ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white transition-transform ${mobile ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </button>
        </div>

        {/* Navigation principale (grand écran) */}
        <nav ref={refNav} aria-label="Navigation principale" className="hidden lg:block">
          <div className={CONTENEUR}>
            <ul className="flex items-stretch justify-between h-12">
              {rubriques.map((r) => {
                const estActif = actif(r);
                if (r.type === 'lien') {
                  return (
                    <li key={r.label} className="flex">
                      <Link href={r.href} onClick={fermer} aria-current={estActif ? 'page' : undefined} className={onglet(estActif, false)}>{r.label}</Link>
                    </li>
                  );
                }
                const estOuvert = ouvert === r.label;
                const idPanneau = `panneau-${r.label.normalize('NFD').replace(/[^\w]+/g, '-').toLowerCase()}`;
                return (
                  <li key={r.label} className="flex" onMouseEnter={() => survol(r.label)} onMouseLeave={() => survol(null)} onBlur={(e) => sortie(e, r.label)}>
                    <button
                      type="button"
                      ref={(el) => { declencheurs.current[r.label] = el; }}
                      aria-expanded={estOuvert}
                      aria-controls={idPanneau}
                      onClick={() => setOuvert((o) => (o === r.label ? null : r.label))}
                      className={onglet(estActif, estOuvert)}
                    >
                      {r.label}
                      <Chevron sens={estOuvert ? 'haut' : 'bas'} className="w-2 h-2.5" />
                    </button>
                    <div id={idPanneau} hidden={!estOuvert} className="absolute left-0 right-0 top-full bg-bande border-b-4 border-nuit shadow-[0_6px_0_rgba(10,15,60,0.08)]">
                      <div className={`${CONTENEUR} py-7`}>
                        <div className="grid gap-x-8 gap-y-6" style={{ gridTemplateColumns: `repeat(${Math.min(Math.max(r.colonnes.length, 4), 6)}, minmax(0, 1fr))` }}>
                          {r.colonnes.map((c) => <Colonne key={c.titre} c={c} fermer={fermer} />)}
                        </div>
                        {r.tout && (
                          <Link href={r.tout.href} onClick={fermer} className="inline-flex items-center gap-2 mt-6 bg-nuit text-white font-display uppercase px-4 py-1.5 hover:bg-bande-fonce">
                            {r.tout.label}<Chevron className="w-2 h-2.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
              <li className="flex" onBlur={(e) => sortie(e, RECHERCHE)}>
                <button
                  type="button"
                  ref={(el) => { declencheurs.current[RECHERCHE] = el; }}
                  aria-expanded={ouvert === RECHERCHE}
                  aria-controls="panneau-recherche"
                  aria-label="Rechercher dans les actualités"
                  onClick={() => setOuvert((o) => (o === RECHERCHE ? null : RECHERCHE))}
                  className={onglet(false, ouvert === RECHERCHE)}
                >
                  <IconeLoupe />
                </button>
                <div id="panneau-recherche" hidden={ouvert !== RECHERCHE} className="absolute left-0 right-0 top-full bg-bande border-b-4 border-nuit">
                  <div className={`${CONTENEUR} py-5 flex justify-end`}>
                    <FormulaireRecherche id="recherche-entete" onEnvoi={fermer} />
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Menu mobile : accordéon de la même structure */}
      {mobile && (
        <nav id="menu-mobile" aria-label="Navigation mobile" className="lg:hidden absolute left-0 right-0 top-full bg-bande text-white border-b-4 border-nuit max-h-[calc(100dvh-5rem)] overflow-y-auto">
          <ul className="divide-y divide-white/25">
            {rubriques.map((r) => {
              if (r.type === 'lien') {
                return (
                  <li key={r.label}>
                    <Link href={r.href} onClick={fermer} aria-current={actif(r) ? 'page' : undefined}
                      className={`flex items-center justify-between px-4 py-3 font-display uppercase text-lg ${actif(r) ? 'bg-bande-fonce' : ''}`}>
                      {r.label}<Chevron className="w-2 h-3" />
                    </Link>
                  </li>
                );
              }
              const estDeplie = deplie === r.label;
              const id = `mobile-${r.label.normalize('NFD').replace(/[^\w]+/g, '-').toLowerCase()}`;
              return (
                <li key={r.label}>
                  <button type="button" aria-expanded={estDeplie} aria-controls={id} onClick={() => setDeplie((d) => (d === r.label ? null : r.label))}
                    className={`w-full flex items-center justify-between px-4 py-3 font-display uppercase text-lg ${actif(r) ? 'bg-bande-fonce' : ''}`}>
                    {r.label}<Chevron sens={estDeplie ? 'haut' : 'bas'} className="w-2 h-3" />
                  </button>
                  <div id={id} hidden={!estDeplie} className="bg-bande-fonce px-4 pt-2 pb-4 space-y-4">
                    {r.colonnes.map((c) => <Colonne key={c.titre} c={c} fermer={fermer} />)}
                    {r.tout && (
                      <Link href={r.tout.href} onClick={fermer} className="inline-flex items-center gap-2 bg-nuit text-white font-display uppercase px-4 py-2">
                        {r.tout.label}<Chevron className="w-2 h-2.5" />
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="px-4 py-4 border-t border-white/25 space-y-4">
            <FormulaireRecherche id="recherche-mobile" onEnvoi={fermer} />
            {reseaux.length > 0 && (
              <div className="flex items-center gap-3">
                <p className="font-display uppercase text-sm">Suivez-nous</p>
                <BoutonsReseaux reseaux={reseaux} taille="sm" />
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
