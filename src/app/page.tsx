import { Anton, Barlow, IBM_Plex_Mono } from 'next/font/google';

const anton = Anton({ subsets: ['latin'], weight: ['400'], variable: '--font-display' });
const barlow = Barlow({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-mono' });

async function getEquipes() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/equipes`, {
    headers: { Accept: 'application/ld+json' },
    cache: 'no-store',
  }).catch(() => null);
  if (!res || !res.ok) return [];
  const data = await res.json();
  return data['hydra:member'] ?? data['member'] ?? [];
}

async function getRencontres() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rencontres`, {
    headers: { Accept: 'application/ld+json' },
    cache: 'no-store',
  }).catch(() => null);
  if (!res || !res.ok) return [];
  const data = await res.json();
  return data['hydra:member'] ?? data['member'] ?? [];
}

export default async function HomePage() {
  const [equipes, rencontres] = await Promise.all([getEquipes(), getRencontres()]);
  const prochainMatch = rencontres[0];

  return (
    <main className={`${anton.variable} ${barlow.variable} ${mono.variable} font-body bg-white text-[#0B1D3A] overflow-x-hidden`}>

      {/* ===== HERO — coupe diagonale ===== */}
      <section className="relative bg-[#0B1D3A] text-white">
        {/* Nav */}
        <div className="relative z-20 max-w-[1400px] mx-auto px-6 md:px-10 py-7 flex items-center justify-between">
          <span className="font-display text-3xl tracking-wide">
            AJSO
          </span>
          <nav className="hidden md:flex gap-10 font-body font-semibold text-sm tracking-wide uppercase text-white/60">
            <a href="#equipes" className="hover:text-white transition-colors">Équipes</a>
            <a href="#calendrier" className="hover:text-white transition-colors">Calendrier</a>
            <a href="#actus" className="hover:text-white transition-colors">Actualités</a>
            <a href="#club" className="hover:text-white transition-colors">Club</a>
          </nav>
        </div>

        {/* Split diagonal photo / navy */}
        <div className="relative min-h-[640px] md:min-h-[720px]">
          {/* Ghost wordmark */}
          <span
            aria-hidden
            className="font-display absolute -left-6 top-1/2 -translate-y-1/2 text-[26vw] leading-none text-white/[0.04] select-none pointer-events-none whitespace-nowrap"
          >
            AJSO
          </span>

          {/* Photo panel, clipped diagonally */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "linear-gradient(100deg, rgba(11,29,58,1) 0%, rgba(11,29,58,0.35) 42%, rgba(11,29,58,0.1) 55%), url('/hero-match.jpg')",
              clipPath: 'polygon(38% 0, 100% 0, 100% 100%, 20% 100%)',
            }}
          />

          {/* Text content */}
          <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 h-full flex flex-col justify-center pt-10 pb-40 md:pb-48">
            <p className="font-mono text-xs tracking-[0.35em] uppercase text-[#E63946] mb-5">
              AJS Ouistreham Handball
            </p>
            <h1 className="font-display text-[15vw] md:text-[7.2vw] leading-[0.85] uppercase max-w-4xl">
              On joue<br />
              pour <span className="text-[#E63946]">gagner.</span>
            </h1>
            <p className="font-body text-white/60 text-base md:text-lg mt-8 max-w-md">
              Toutes les équipes, tous les matchs, tous les résultats du club — au même endroit.
            </p>
          </div>
        </div>

        {/* Floating scoreboard card, straddling the seam */}
        <div className="relative z-20 max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="-mt-28 md:-mt-24 mb-[-1px]">
            {prochainMatch ? (
              <div className="bg-white text-[#0B1D3A] shadow-2xl shadow-black/40 max-w-xl md:ml-auto">
                <div className="bg-[#E63946] text-white px-6 py-2.5 flex items-center justify-between">
                  <span className="font-display text-sm tracking-wider uppercase">Prochain match</span>
                  <span className="font-mono text-[11px] tracking-widest">
                    {prochainMatch.domicile ? 'DOMICILE' : 'EXTÉRIEUR'}
                  </span>
                </div>
                <div className="px-6 py-7 flex items-center justify-between gap-4">
                  <p className="font-display text-lg md:text-2xl uppercase leading-none flex-1">
                    {prochainMatch.equipe?.nom ?? 'AJSO'}
                  </p>
                  <span className="font-display text-2xl text-[#0B1D3A]/25 px-2">VS</span>
                  <p className="font-display text-lg md:text-2xl uppercase leading-none flex-1 text-right">
                    {prochainMatch.equipeAdverse?.nom ?? 'Adversaire'}
                  </p>
                </div>
                <div className="px-6 py-4 border-t border-[#0B1D3A]/10 flex items-center gap-6 font-mono text-sm">
                  <span className="text-[#0B1D3A]/70">
                    {new Date(prochainMatch.date).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
                  </span>
                  <span className="text-[#E63946] font-semibold">
                    {typeof prochainMatch.heure === 'string' ? prochainMatch.heure.slice(0, 5) : ''}
                  </span>
                  <span className="text-[#0B1D3A]/40 ml-auto">{prochainMatch.lieu}</span>
                </div>
              </div>
            ) : (
              <div className="bg-white text-[#0B1D3A]/50 shadow-2xl shadow-black/40 max-w-xl md:ml-auto px-6 py-7 font-mono text-sm">
                Aucun match programmé pour l'instant.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== NOS EQUIPES ===== */}
      <section id="equipes" className="max-w-[1400px] mx-auto px-6 md:px-10 pt-32 pb-20">
        <div className="flex items-end justify-between mb-12 gap-6">
          <h2 className="font-display text-4xl md:text-6xl uppercase leading-none">
            Nos<br />équipes
          </h2>
          <span className="font-mono text-xs text-[#0B1D3A]/40 mb-2">{equipes.length} équipes engagées</span>
        </div>

        {equipes.length === 0 ? (
          <p className="text-[#0B1D3A]/50 font-body">Les équipes seront affichées ici.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipes.map((equipe: any, i: number) => (
              <a
                key={equipe.id}
                href={`/equipes/${equipe.id}`}
                className="group relative bg-[#F1F3F6] hover:bg-[#0B1D3A] transition-colors duration-300 p-8 overflow-hidden"
              >
                <span className="font-mono text-[11px] text-[#E63946] block mb-6">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="font-display text-2xl uppercase leading-tight text-[#0B1D3A] group-hover:text-white transition-colors duration-300">
                  {equipe.nom}
                </p>
                <span className="absolute bottom-6 right-8 font-display text-sm text-[#0B1D3A]/0 group-hover:text-[#E63946] transition-colors duration-300 uppercase tracking-wide">
                  Voir →
                </span>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* ===== CALENDRIER / RESULTATS ===== */}
      <section id="calendrier" className="bg-[#0B1D3A] text-white py-24">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <h2 className="font-display text-4xl md:text-6xl uppercase mb-14">
            Calendrier <span className="text-[#E63946]">&</span> résultats
          </h2>

          {rencontres.length === 0 ? (
            <p className="text-white/40 font-body">Aucune rencontre enregistrée pour l'instant.</p>
          ) : (
            <div className="divide-y divide-white/10 border-t border-white/10">
              {rencontres.map((r: any) => {
                const joue = r.scoreDom !== null && r.scoreDom !== undefined;
                const d = new Date(r.date);
                return (
                  <div key={r.id} className="py-7 flex flex-wrap items-center gap-6 md:gap-10 group">
                    <div className="font-display leading-none min-w-[70px]">
                      <span className="text-3xl block">{d.toLocaleDateString('fr-FR', { day: '2-digit' })}</span>
                      <span className="font-mono text-[10px] text-white/40 uppercase">
                        {d.toLocaleDateString('fr-FR', { month: 'short' })}
                      </span>
                    </div>
                    <p className="font-display text-lg uppercase flex-1 min-w-[140px]">{r.equipe?.nom}</p>
                    {joue ? (
                      <span className="font-mono text-2xl font-bold text-[#E63946] min-w-[100px] text-center">
                        {r.scoreDom}–{r.scoreExt}
                      </span>
                    ) : (
                      <span className="font-display text-lg text-white/25 min-w-[100px] text-center">VS</span>
                    )}
                    <p className="font-display text-lg uppercase flex-1 min-w-[140px] text-right md:text-left">{r.equipeAdverse?.nom}</p>
                    <span className="font-mono text-[11px] text-white/30 ml-auto hidden md:block">{r.lieu}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ===== ACTUALITES ===== */}
      <section id="actus" className="max-w-[1400px] mx-auto px-6 md:px-10 py-24">
        <h2 className="font-display text-4xl md:text-6xl uppercase mb-14">Actualités</h2>
        <div className="border border-[#0B1D3A]/10 p-14 text-center">
          <p className="text-[#0B1D3A]/40 font-body">Les articles du club seront affichés ici.</p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer id="club" className="relative bg-[#0B1D3A] text-white pt-20 pb-10 overflow-hidden">
        <span
          aria-hidden
          className="font-display absolute -bottom-10 left-1/2 -translate-x-1/2 text-[18vw] leading-none text-white/[0.04] select-none pointer-events-none whitespace-nowrap"
        >
          AJSO
        </span>
        <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between gap-10 pb-16">
          <div>
            <p className="font-display text-3xl mb-2">AJSO HANDBALL</p>
            <p className="font-mono text-xs text-white/40">Ouistreham Riva-Bella · Calvados</p>
          </div>
          <div className="font-body text-sm text-white/50 space-y-1">
            <p>ajso.handball@gmail.com</p>
            <p>Complexe sportif Maurice Chevalier, Ouistreham</p>
          </div>
        </div>
        <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 pt-6 border-t border-white/10 font-mono text-[11px] text-white/30">
          © {new Date().getFullYear()} AJS Ouistreham Handball
        </div>
      </footer>
    </main>
  );
}