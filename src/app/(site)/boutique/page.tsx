import type { Metadata } from 'next';
import { BoutonLien, PageHero, Section, Vide } from '@/components/ui';
import { getClub, getProduits } from '@/lib/api';
import { formatPrix } from '@/lib/format';
import ImageContenu from '@/components/ImageContenu';
import Logo from '@/components/Logo';

export const metadata: Metadata = { title: 'Boutique', description: "Maillots, sweats et goodies aux couleurs de l'AJSO Handball." };

export default async function BoutiquePage() {
  const [produits, club] = await Promise.all([getProduits(), getClub()]);

  return (
    <>
      <PageHero surtitre="Aux couleurs des Ratons" titre="Boutique">
        Maillots, textiles et goodies du club. Chaque achat soutient l&apos;AJSO !
      </PageHero>
      <Section>
        {club?.boutiqueUrl && (
          <div className="bg-losange text-white p-8 md:p-10 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xl shadow-violet/20">
            <div>
              <p className="font-display text-3xl uppercase">Boutique en ligne</p>
              <p className="text-white/80">Commande et paiement sécurisés en ligne.</p>
            </div>
            <a href={club.boutiqueUrl} target="_blank" rel="noopener noreferrer" className="bg-jaune text-nuit font-display uppercase tracking-wider text-lg px-7 py-3.5 hover:bg-white self-start">
              Commander en ligne →
            </a>
          </div>
        )}
        {produits.length === 0 ? <Vide>Les articles du club arrivent bientôt.</Vide> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {produits.map((p) => {
              const lien = p.lien ?? club?.boutiqueUrl ?? null;
              return (
                <article key={p.id} className={`group bg-white ring-1 ring-nuit/10 shadow-sm hover:shadow-xl hover:shadow-nuit/10 transition-shadow flex flex-col ${p.disponible ? '' : 'opacity-70'}`}>
                  <div className={`aspect-[4/3] relative overflow-hidden flex items-center justify-center ${p.image ? 'bg-papier' : 'bg-nuit motif-losanges'}`}>
                    {p.image ? (
                      <ImageContenu src={p.image} alt={p.nom} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-contain" />
                    ) : (
                      <span aria-hidden className="relative flex items-center justify-center w-full h-full">
                        <span className="absolute w-1/2 aspect-square rotate-45 bg-losange opacity-70 group-hover:rotate-[60deg] transition-transform duration-700" />
                        <span className="relative"><Logo size={120} decoratif /></span>
                      </span>
                    )}
                    {!p.disponible && <span className="absolute top-3 left-3 bg-nuit text-white font-mono text-[11px] uppercase px-2.5 py-1">Épuisé</span>}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-display text-2xl uppercase leading-tight">{p.nom}</h2>
                      <p className="font-display text-2xl bg-jaune text-nuit px-2.5 leading-9 whitespace-nowrap">{formatPrix(p.prix)}</p>
                    </div>
                    {p.tailles && <p className="font-mono text-xs text-nuit/60 mt-2">Tailles : {p.tailles}</p>}
                    {p.description && <p className="text-nuit/70 mt-3 text-sm">{p.description}</p>}
                    <div className="mt-auto pt-5">
                      {p.disponible && (lien ? (
                        <a href={lien} target="_blank" rel="noopener noreferrer" className="inline-block bg-nuit text-white font-display uppercase tracking-wide px-5 py-2.5 hover:bg-roi">Commander →</a>
                      ) : (
                        <BoutonLien href={`/contact?sujet=${encodeURIComponent(`Commande : ${p.nom}`)}`} variante="nuit">Commander</BoutonLien>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <p className="flex items-center gap-3 text-sm text-nuit/70 mt-10"><span aria-hidden className="w-2 h-2 rotate-45 bg-jaune" />Retrait des commandes au gymnase les soirs d&apos;entraînement ou de match.</p>
      </Section>
    </>
  );
}
