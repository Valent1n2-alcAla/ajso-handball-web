import Link from 'next/link';
import MasqueSur from './MasqueSur';
import BoutonsReseaux from './Reseaux';
import CarrouselPartenaires from './CarrouselPartenaires';
import { BoutonLien, Chevron, CONTENEUR } from './ui';
import { saisonCourante } from '@/lib/saison';
import type { Reseau } from '@/lib/site';
import type { Club, Partenaire } from '@/lib/types';

export default function Footer({ club, partenaires = [], reseaux }: { club: Club | null; partenaires?: Partenaire[]; reseaux: Reseau[] }) {
  return (
    <footer className="mt-auto pt-10">
      {/* Bande sombre : réseaux, inscriptions, contact */}
      <div className="bg-nuit text-white">
        {reseaux.length > 0 && (
          <div className={`${CONTENEUR} flex items-center gap-6`}>
            <p className="font-display uppercase text-sm tracking-wide">Suivez-nous</p>
            <BoutonsReseaux reseaux={reseaux} taille="sm" />
          </div>
        )}
        <div className={`${CONTENEUR} py-9 md:py-11 grid gap-8 md:grid-cols-[1fr_auto] md:items-center`}>
          <div>
            <p className="font-display uppercase text-2xl md:text-[1.9rem] leading-tight">Inscriptions {saisonCourante()} : rejoignez les Ratons&nbsp;!</p>
            <address className="not-italic text-[14px] text-white/80 mt-2 flex flex-wrap gap-x-5 gap-y-1">
              {club?.adresse && <span>{club.adresse}</span>}
              {club?.email && <a href={`mailto:${club.email}`} className="text-white hover:underline">{club.email}</a>}
              {club?.telephone && <a href={`tel:${club.telephone.replace(/\s/g, '')}`} className="text-white hover:underline">{club.telephone}</a>}
            </address>
          </div>
          <div className="flex flex-wrap gap-3">
            <BoutonLien href="/inscriptions" variante="jaune">S&apos;inscrire<Chevron className="w-2 h-2.5" /></BoutonLien>
            <BoutonLien href="/contact" variante="contour">Nous contacter</BoutonLien>
          </div>
        </div>
      </div>

      {/* Partenaires (masqué sur la page qui les présente déjà) */}
      {partenaires.length > 0 && (
        <MasqueSur chemins={['/partenaires']}>
          <div className={`${CONTENEUR} pt-10 pb-4`}>
            <h2 className="font-display uppercase text-bande text-[1.9rem] text-center mb-6">Nos partenaires</h2>
            <CarrouselPartenaires partenaires={partenaires} />
          </div>
        </MasqueSur>
      )}

      {/* Pied de page */}
      <div className={`${CONTENEUR} pt-6`}>
        <div className="relative border-t border-encre/60 pt-5 pb-8 pr-16 flex flex-col sm:flex-row sm:justify-between gap-2 text-[13px] text-encre">
          <p>© {new Date().getFullYear()} - AJS Ouistreham Handball</p>
          <p className="flex flex-wrap gap-x-2">
            <Link href="/mentions-legales" className="hover:underline">Mentions légales</Link>
            <span aria-hidden>/</span>
            <Link href="/admin" className="hover:underline">Espace club</Link>
          </p>
          <a href="#haut" aria-label="Haut de page" className="absolute right-0 -top-px w-12 h-12 bg-nuit text-white flex items-center justify-center hover:bg-bande-fonce">
            <Chevron sens="haut" className="w-3 h-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
