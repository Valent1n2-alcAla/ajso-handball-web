import Link from 'next/link';
import Logo from './Logo';
import MasqueSur from './MasqueSur';
import ImageContenu from './ImageContenu';
import { NAV, NAV_CLUB } from '@/lib/site';
import type { Club, Partenaire } from '@/lib/types';

function IconeFacebook() {
  return <svg aria-hidden viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z" /></svg>;
}
function IconeInstagram() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

function TitreColonne({ children }: { children: string }) {
  return (
    <p className="flex items-center gap-2.5 font-display text-lg uppercase tracking-wide mb-5 text-white">
      <span aria-hidden className="w-2 h-2 rotate-45 bg-jaune" />{children}
    </p>
  );
}

export default function Footer({ club, partenaires = [] }: { club: Club | null; partenaires?: Partenaire[] }) {
  const reseaux = [
    club?.facebook ? { href: club.facebook, label: 'Facebook', icone: <IconeFacebook /> } : null,
    club?.instagram ? { href: club.instagram, label: 'Instagram', icone: <IconeInstagram /> } : null,
  ].filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <footer className="relative bg-nuit text-white overflow-hidden mt-auto">
      <div aria-hidden className="h-1 bg-losange" />

      {/* Partenaires */}
      {partenaires.length > 0 && (
        <MasqueSur chemins={['/partenaires']}>
        <div className="border-b border-white/10 bg-nuit-2/60">
          <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-8 flex flex-col md:flex-row md:items-center gap-5 md:gap-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-glacier shrink-0">Ils nous soutiennent</p>
            <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
              {partenaires.map((p) => {
                const contenu = p.logo
                  ? <ImageContenu src={p.logo} alt={p.nom} width={160} height={64} sizes="160px" className="max-h-10 w-auto object-contain brightness-0 invert opacity-70 hover:opacity-100 transition-opacity" />
                  : <span className="font-display uppercase tracking-wide text-white/75 hover:text-white transition-colors">{p.nom}</span>;
                return (
                  <li key={p.id}>
                    {p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer">{contenu}</a> : contenu}
                  </li>
                );
              })}
              <li><Link href="/partenaires" className="font-mono text-[11px] uppercase tracking-widest text-jaune hover:text-white">Devenir partenaire →</Link></li>
            </ul>
          </div>
        </div>
        </MasqueSur>
      )}

      <div className="relative motif-losanges">
        <div aria-hidden className="absolute -right-32 -bottom-48 w-[520px] aspect-square rotate-45 border-[28px] border-white/[0.03]" />
        <div aria-hidden className="absolute -left-20 -top-24 w-60 aspect-square rotate-45 bg-losange opacity-20" />

        <div className="relative max-w-[1400px] mx-auto px-4 md:px-10 pt-16 md:pt-20 pb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-[1.3fr_1.4fr_1fr]">
          {/* Identité */}
          <div>
            <Link href="/" className="inline-flex items-center gap-4 mb-6" aria-label="AJSO Handball, accueil">
              <Logo size={84} />
              <span aria-hidden>
                <span className="block font-display text-3xl leading-none">AJSO HANDBALL</span>
                <span className="block font-mono text-xs text-glacier mt-2">Ouistreham Riva-Bella · Calvados</span>
              </span>
            </Link>
            <p className="text-white/70 max-w-sm">
              Du Baby Hand aux Seniors, le club de handball de Ouistreham Riva-Bella. Bienvenue chez les Ratons&nbsp;!
            </p>
            {club?.label && (
              <p className="inline-flex items-center gap-2 mt-6 font-mono text-[11px] tracking-widest uppercase border border-jaune/50 text-jaune px-3 py-1.5">
                <span aria-hidden className="w-1.5 h-1.5 rotate-45 bg-jaune" />{club.label}
              </p>
            )}
            {reseaux.length > 0 && (
              <ul className="flex gap-3 mt-6">
                {reseaux.map((r) => (
                  <li key={r.label}>
                    <a href={r.href} target="_blank" rel="noopener noreferrer" aria-label={`${r.label} (nouvel onglet)`}
                      className="w-11 h-11 flex items-center justify-center border border-white/20 text-white/80 hover:bg-jaune hover:border-jaune hover:text-nuit transition-colors">
                      {r.icone}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Navigation */}
          <nav aria-label="Pied de page" className="grid grid-cols-2 gap-8">
            <div>
              <TitreColonne>La saison</TitreColonne>
              <ul className="space-y-2.5 text-white/70">
                {NAV.map((l) => (
                  <li key={l.href}><Link href={l.href} className="hover:text-jaune transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <TitreColonne>Le club</TitreColonne>
              <ul className="space-y-2.5 text-white/70">
                {NAV_CLUB.map((l) => (
                  <li key={l.href}><Link href={l.href} className="hover:text-jaune transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Contact */}
          <div className="text-white/70 md:col-span-2 lg:col-span-1">
            <TitreColonne>Contact</TitreColonne>
            <address className="not-italic space-y-3">
              {club?.adresse && <p>{club.adresse}</p>}
              {club?.email && (
                <p><a href={`mailto:${club.email}`} className="text-white hover:text-jaune transition-colors break-all">{club.email}</a></p>
              )}
              {club?.telephone && (
                <p><a href={`tel:${club.telephone.replace(/\s/g, '')}`} className="text-white hover:text-jaune transition-colors">{club.telephone}</a></p>
              )}
            </address>
            <Link href="/contact" className="inline-flex items-center gap-2 mt-6 bg-jaune text-nuit font-display uppercase tracking-wider px-5 py-3 hover:bg-white transition-colors">
              Nous écrire <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <div className="relative max-w-[1400px] mx-auto px-4 md:px-10 py-6 border-t border-white/10 flex flex-wrap justify-between gap-3 font-mono text-[11px] text-white/55">
          <span>© {new Date().getFullYear()} AJS Ouistreham Handball</span>
          <span className="flex gap-5">
            <Link href="/mentions-legales" className="hover:text-white">Mentions légales</Link>
            <Link href="/admin" className="hover:text-white">Espace club</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
