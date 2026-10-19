import type { Metadata } from 'next';
import { BoutonLien, PageHero, Section, Vide } from '@/components/ui';
import { getClub, getProduits } from '@/lib/api';
import { formatPrix } from '@/lib/format';
import ImageContenu from '@/components/ImageContenu';

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
          <div className="bg-losange text-white p-8 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-5">
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {produits.map((p) => {
              const lien = p.lien ?? club?.boutiqueUrl ?? null;
              return (
                <article key={p.id} className={`bg-papier flex flex-col ${p.disponible ? '' : 'opacity-60'}`}>
                  <div className="aspect-square bg-white relative overflow-hidden flex items-center justify-center">
                    {p.image ? (
                      <ImageContenu src={p.image} alt={p.nom} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-contain" />
                    ) : (
                      <span className="w-1/2 aspect-square rotate-45 bg-losange opacity-20" />
                    )}
                    {!p.disponible && <span className="absolute top-3 left-3 bg-nuit text-white font-mono text-[11px] uppercase px-2.5 py-1">Épuisé</span>}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-display text-2xl uppercase leading-tight">{p.nom}</h2>
                      <p className="font-display text-2xl text-violet whitespace-nowrap">{formatPrix(p.prix)}</p>
                    </div>
                    {p.tailles && <p className="font-mono text-xs text-nuit/50 mt-1">Tailles : {p.tailles}</p>}
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
        <p className="text-sm text-nuit/50 mt-10">Retrait des commandes au gymnase les soirs d&apos;entraînement ou de match.</p>
      </Section>
    </>
  );
}
