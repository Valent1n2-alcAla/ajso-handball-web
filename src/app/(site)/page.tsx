import Link from 'next/link';
import Logo from '@/components/Logo';
import { CarteEvenement } from '@/components/Evenement';
import { CarteMatch, LigneMatch } from '@/components/Match';
import { BoutonLien, Section, Vide } from '@/components/ui';
import { getActualites, getDerniersResultats, getEquipesClub, getEvenements, getPartenaires, getProchainsMatchs } from '@/lib/api';
import { extrait, formatDatePub } from '@/lib/format';
import ImageContenu from '@/components/ImageContenu';

export default async function Accueil() {
  const [equipes, prochains, resultats, actus, partenaires, evenements] = await Promise.all([
    getEquipesClub(), getProchainsMatchs(), getDerniersResultats(), getActualites(), getPartenaires(), getEvenements('avenir'),
  ]);
  const prochainMatch = prochains[0];

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative bg-nuit text-white overflow-hidden motif-losanges">
        <span aria-hidden className="font-display absolute -left-6 top-1/2 -translate-y-1/2 text-[28vw] leading-none text-white/[0.03] select-none pointer-events-none whitespace-nowrap">
          AJSO
        </span>
        <div aria-hidden className="absolute right-[-12%] top-1/2 -translate-y-1/2 w-[70vw] max-w-[760px] aspect-square rotate-45 bg-losange opacity-60" />
        <div aria-hidden className="absolute right-[-12%] top-1/2 -translate-y-1/2 w-[70vw] max-w-[760px] aspect-square rotate-45 border-[10px] border-glacier/30" />

        <div className="relative max-w-[1400px] mx-auto px-4 md:px-10 pt-16 pb-36 md:pt-24 md:pb-44 grid md:grid-cols-[1.3fr_1fr] items-center gap-10">
          <div>
            <p className="font-mono text-xs tracking-[0.35em] uppercase text-jaune mb-5">AJS Ouistreham Handball</p>
            <h1 className="font-display text-[17vw] md:text-[7.4vw] leading-[0.85] uppercase">
              Fiers d&apos;être<br />
              <span className="text-degrade">les Ratons.</span>
            </h1>
            <p className="text-white/70 text-base md:text-lg mt-8 max-w-md">
              Du Baby Hand aux Seniors, toutes les équipes, tous les matchs et tous les résultats du club de Ouistreham Riva-Bella.
            </p>
            <div className="flex flex-wrap gap-3 mt-10">
              <BoutonLien href="/inscriptions">Rejoindre le club</BoutonLien>
              <BoutonLien href="/calendrier" variante="contour">Calendrier</BoutonLien>
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <Logo size={320} className="drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)]" />
          </div>
        </div>
      </section>

      {/* Carte prochain match à cheval sur la jointure */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-10 -mt-24 md:-mt-28">
        <div className="max-w-xl md:ml-auto">
          {prochainMatch ? (
            <CarteMatch r={prochainMatch} />
          ) : (
            <div className="bg-white shadow-2xl shadow-nuit/30 px-6 py-7 font-mono text-sm text-nuit/50">
              Aucun match programmé pour l&apos;instant.
            </div>
          )}
        </div>
      </div>

      {/* ===== RESULTATS ===== */}
      <Section titre={<>Derniers<br />résultats</>} action={{ href: '/calendrier?vue=resultats', label: 'Tous les résultats' }}>
        {resultats.length === 0 ? (
          <Vide>Les résultats apparaîtront ici après les premiers matchs.</Vide>
        ) : (
          <div className="divide-y divide-nuit/10 border-y border-nuit/10">
            {resultats.slice(0, 4).map((r) => <LigneMatch key={r.id} r={r} />)}
          </div>
        )}
      </Section>

      {/* ===== EQUIPES ===== */}
      <section className="bg-papier">
        <Section titre={<>Nos<br />équipes</>} action={{ href: '/equipes', label: `${equipes.length} équipes` }}>
          {equipes.length === 0 ? (
            <Vide>Les équipes seront affichées ici.</Vide>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {equipes.map((e, i) => (
                <Link
                  key={e.id}
                  href={`/equipes/${e.id}`}
                  className="group relative bg-white hover:bg-nuit transition-colors duration-300 p-5 md:p-8 overflow-hidden min-h-[140px] md:min-h-[180px] flex flex-col"
                >
                  <span aria-hidden className="absolute -right-10 -bottom-10 w-28 h-28 rotate-45 bg-losange opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="font-mono text-[11px] text-violet group-hover:text-glacier block mb-4">{String(i + 1).padStart(2, '0')}</span>
                  <p className="font-display text-xl md:text-3xl uppercase leading-tight group-hover:text-white transition-colors">{e.nom}</p>
                  <p className="mt-auto pt-3 text-xs md:text-sm text-nuit/50 group-hover:text-white/60">{e.championnat?.nom ?? e.categorie?.nom}</p>
                </Link>
              ))}
            </div>
          )}
        </Section>
      </section>

      {/* ===== A VENIR ===== */}
      <section className="bg-nuit text-white motif-losanges">
        <Section sombre titre={<>À <span className="text-jaune">venir</span></>} action={{ href: '/calendrier', label: 'Calendrier complet' }}>
          {prochains.length === 0 ? (
            <p className="text-white/40">Aucune rencontre programmée.</p>
          ) : (
            <div className="divide-y divide-white/10 border-y border-white/10">
              {prochains.slice(0, 5).map((r) => <LigneMatch key={r.id} r={r} sombre />)}
            </div>
          )}
        </Section>
      </section>

      {/* ===== AGENDA ===== */}
      {evenements.length > 0 && (
        <Section titre="Agenda" action={{ href: '/agenda', label: 'Tout l\'agenda' }}>
          <div className="grid lg:grid-cols-2 gap-6">
            {evenements.slice(0, 2).map((e) => <CarteEvenement key={e.id} e={e} />)}
          </div>
        </Section>
      )}

      {/* ===== ACTUS ===== */}
      <Section titre="Actualités" action={{ href: '/actualites', label: 'Toutes les actus' }}>
        {actus.length === 0 ? (
          <Vide>Les articles du club seront affichés ici.</Vide>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {actus.slice(0, 3).map((a, i) => (
              <Link key={a.id} href={`/actualites/${a.id}`} className="group block">
                <div className={`aspect-[16/10] mb-5 overflow-hidden relative ${i === 0 ? 'bg-losange' : 'bg-nuit'}`}>
                  {a.image ? (
                    <ImageContenu src={a.image} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center font-display text-6xl text-white/10">AJSO</span>
                  )}
                </div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-violet mb-2">{formatDatePub(a.datePub)}</p>
                <h3 className="font-display text-2xl uppercase leading-tight group-hover:text-roi transition-colors">{a.titre}</h3>
                <p className="text-nuit/60 mt-2">{extrait(a.extrait ?? a.contenu, 140)}</p>
              </Link>
            ))}
          </div>
        )}
      </Section>

      {/* ===== CTA ===== */}
      <section className="bg-losange text-white">
        <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-16 md:py-20 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <p className="font-mono text-xs tracking-[0.35em] uppercase text-jaune mb-3">Saison en cours</p>
            <h2 className="font-display text-4xl md:text-6xl uppercase leading-none">Viens essayer le hand !</h2>
            <p className="text-white/80 mt-4 max-w-xl">Séances d&apos;essai gratuites, toutes catégories, filles et garçons dès 3 ans.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <BoutonLien href="/inscriptions">Inscriptions</BoutonLien>
            <BoutonLien href="/entrainements" variante="contour">Horaires</BoutonLien>
          </div>
        </div>
      </section>

      {/* ===== PARTENAIRES ===== */}
      {partenaires.length > 0 && (
        <Section titre="Ils nous soutiennent" action={{ href: '/partenaires', label: 'Partenaires' }}>
          <div className="flex flex-wrap items-center gap-4">
            {partenaires.map((p) => (
              <div key={p.id} className="border border-nuit/10 px-6 py-4 min-h-20 flex items-center">
                {p.logo ? (
                  <ImageContenu src={p.logo} alt={p.nom} width={240} height={96} sizes="240px" className="max-h-12 w-auto" />
                ) : (
                  <span className="font-display uppercase text-lg text-nuit/70">{p.nom}</span>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
