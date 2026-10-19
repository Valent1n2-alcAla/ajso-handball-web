import type { Metadata } from 'next';
import { BoutonLien, Chevron, Section, TitrePage, Vide } from '@/components/ui';
import { getClub, getProduits } from '@/lib/api';
import { formatPrix } from '@/lib/format';
import ImageContenu from '@/components/ImageContenu';
import Logo from '@/components/Logo';

export const metadata: Metadata = { title: 'Boutique', description: "Maillots, sweats et goodies aux couleurs de l'AJSO Handball." };

export default async function BoutiquePage() {
  const [produits, club] = await Promise.all([getProduits(), getClub()]);

  return (
    <>
      <TitrePage titre="Boutique">
        Maillots, textiles et goodies du club. Chaque achat soutient l&apos;AJSO !
      </TitrePage>
      <Section>
        {club?.boutiqueUrl && (
          <div className="bg-bande text-white p-5 md:p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="font-display text-2xl uppercase">Boutique en ligne</p>
              <p className="text-[14.5px]">Commande et paiement sécurisés en ligne.</p>
            </div>
            <BoutonLien href={club.boutiqueUrl} variante="nuit" externe>Commander en ligne<Chevron className="w-2 h-2.5" /><span className="sr-only">(nouvel onglet)</span></BoutonLien>
          </div>
        )}
        {produits.length === 0 ? <Vide>Les articles du club arrivent bientôt.</Vide> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {produits.map((p) => {
              const lien = p.lien ?? club?.boutiqueUrl ?? null;
              return (
                <article key={p.id} className="border border-filet flex flex-col">
                  <div className={`aspect-[4/3] relative overflow-hidden flex items-center justify-center ${p.image ? 'bg-white' : 'bg-papier'}`}>
                    {p.image ? (
                      <ImageContenu src={p.image} alt={p.nom} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-contain" />
                    ) : (
                      <span aria-hidden className="opacity-30"><Logo size={120} decoratif /></span>
                    )}
                    {!p.disponible && <span className="absolute top-0 left-0 bg-nuit text-white font-display uppercase text-[14px] px-2.5 py-1">Épuisé</span>}
                  </div>
                  <div className="p-4 border-t border-filet flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-display text-xl uppercase leading-tight text-nuit">{p.nom}</h2>
                      <p className="font-display text-xl text-bande whitespace-nowrap">{formatPrix(p.prix)}</p>
                    </div>
                    {p.tailles && <p className="text-[13px] text-encre/80 mt-1">Tailles : {p.tailles}</p>}
                    {p.description && <p className="mt-2 text-[14px]">{p.description}</p>}
                    <div className="mt-auto pt-4">
                      {p.disponible && (lien ? (
                        <BoutonLien href={lien} taille="sm" externe>Commander<Chevron className="w-2 h-2.5" /><span className="sr-only">(nouvel onglet)</span></BoutonLien>
                      ) : (
                        <BoutonLien href={`/contact?sujet=${encodeURIComponent(`Commande : ${p.nom}`)}`} taille="sm">Commander<Chevron className="w-2 h-2.5" /></BoutonLien>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <ul className="liste-chevrons text-[14px] mt-6"><li>Retrait des commandes au gymnase les soirs d&apos;entraînement ou de match.</li></ul>
      </Section>
    </>
  );
}
