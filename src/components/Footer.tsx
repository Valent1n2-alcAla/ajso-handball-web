import Link from 'next/link';
import Logo from './Logo';
import { NAV, NAV_CLUB } from '@/lib/site';
import type { Club } from '@/lib/types';

export default function Footer({ club }: { club: Club | null }) {
  return (
    <footer className="relative bg-nuit text-white pt-20 pb-10 overflow-hidden motif-losanges mt-auto">
      <span
        aria-hidden
        className="font-display absolute -bottom-8 left-1/2 -translate-x-1/2 text-[22vw] leading-none text-white/[0.03] select-none pointer-events-none whitespace-nowrap"
      >
        AJSO
      </span>
      <div className="relative max-w-[1400px] mx-auto px-4 md:px-10 grid gap-12 md:grid-cols-[1.4fr_1fr_1fr] pb-14">
        <div>
          <div className="flex items-center gap-4 mb-5">
            <Logo size={72} />
            <div>
              <p className="font-display text-3xl leading-none">AJSO HANDBALL</p>
              <p className="font-mono text-xs text-glacier mt-1">Ouistreham Riva-Bella · Calvados</p>
            </div>
          </div>
          {club?.label && (
            <p className="inline-block font-mono text-[11px] tracking-widest uppercase border border-jaune/50 text-jaune px-3 py-1">
              {club.label}
            </p>
          )}
        </div>

        <div>
          <p className="font-display text-lg uppercase mb-4 text-white/90">Navigation</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-white/60">
            {[...NAV, ...NAV_CLUB].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-jaune transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-sm text-white/60 space-y-2">
          <p className="font-display text-lg uppercase mb-4 text-white/90">Contact</p>
          {club?.adresse && <p>{club.adresse}</p>}
          {club?.email && (
            <p><a href={`mailto:${club.email}`} className="hover:text-jaune">{club.email}</a></p>
          )}
          {club?.telephone && (
            <p><a href={`tel:${club.telephone.replace(/\s/g, '')}`} className="hover:text-jaune">{club.telephone}</a></p>
          )}
          <div className="flex gap-3 pt-3">
            {club?.facebook && <a href={club.facebook} target="_blank" rel="noopener noreferrer" className="border border-white/20 px-3 py-1.5 hover:border-jaune hover:text-jaune">Facebook</a>}
            {club?.instagram && <a href={club.instagram} target="_blank" rel="noopener noreferrer" className="border border-white/20 px-3 py-1.5 hover:border-jaune hover:text-jaune">Instagram</a>}
          </div>
        </div>
      </div>
      <div className="relative max-w-[1400px] mx-auto px-4 md:px-10 pt-6 border-t border-white/10 flex flex-wrap justify-between gap-3 font-mono text-[11px] text-white/30">
        <span>© {new Date().getFullYear()} AJS Ouistreham Handball</span>
        <span className="flex gap-4">
          <Link href="/mentions-legales" className="hover:text-white">Mentions légales</Link>
          <Link href="/admin" className="hover:text-white">Espace club</Link>
        </span>
      </div>
    </footer>
  );
}
