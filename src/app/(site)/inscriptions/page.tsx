import type { Metadata } from 'next';
import { BoutonLien, PageHero, Section } from '@/components/ui';
import { getTarifs } from '@/lib/api';

export const metadata: Metadata = { title: 'Inscriptions & licences', description: "Tarifs des licences, pièces à fournir et démarche d'inscription à l'AJSO Handball." };

const ETAPES = [
  ['Essayer', "Venez faire deux séances d'essai gratuites sur le créneau de votre catégorie."],
  ['Remplir', 'Complétez la licence en ligne via le lien Gest\'Hand envoyé par le club.'],
  ['Fournir', 'Photo, pièce d\'identité, certificat médical ou questionnaire de santé, autorisation parentale pour les mineurs.'],
  ['Régler', 'Paiement en une ou plusieurs fois. Pass\'Sport, chèques ANCV et coupons sport acceptés.'],
];

export default async function InscriptionsPage() {
  const tarifs = await getTarifs();

  return (
    <>
      <PageHero surtitre="Rejoindre l'AJSO" titre={<>Inscriptions <span className="text-jaune">&amp;</span> licences</>}>
        Filles et garçons dès 3 ans, débutants ou confirmés : il y a une place pour toi chez les Ratons.
      </PageHero>

      <Section surtitre="En quatre étapes" titre="Comment s'inscrire ?">
        <ol className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {ETAPES.map(([t, d], i) => (
            <li key={t} className="bg-papier p-7 relative">
              <span className="font-display text-6xl text-violet/20 absolute right-5 top-3">{i + 1}</span>
              <h3 className="font-display text-2xl uppercase mb-2">{t}</h3>
              <p className="text-nuit/70 text-sm">{d}</p>
            </li>
          ))}
        </ol>
      </Section>

      <section className="bg-nuit text-white motif-losanges">
        <Section sombre surtitre="Saison en cours" titre="Tarifs">
          {tarifs.length === 0 ? <p className="text-white/50">Tarifs de la saison bientôt disponibles.</p> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tarifs.map((t) => (
                <div key={t.id} className="border border-white/15 p-7 flex flex-col">
                  <p className="font-display text-2xl uppercase">{t.categorie}</p>
                  {t.anneesNaissance && <p className="font-mono text-xs text-glacier mt-1">Né(e)s {t.anneesNaissance}</p>}
                  <p className="font-display text-6xl text-jaune mt-6">{t.prix}<span className="text-2xl align-top ml-1">€</span></p>
                  {t.details && <p className="text-sm text-white/60 mt-3">{t.details}</p>}
                </div>
              ))}
            </div>
          )}
          <p className="text-white/50 text-sm mt-8">Réduction famille à partir du 2ᵉ licencié. Contactez-nous pour toute situation particulière.</p>
        </Section>
      </section>

      <Section>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-losange text-white p-10">
          <div>
            <h2 className="font-display text-4xl uppercase">Une question ?</h2>
            <p className="text-white/80 mt-2">Le bureau vous répond rapidement.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <BoutonLien href="/contact?sujet=Inscription">Contact</BoutonLien>
            <BoutonLien href="/entrainements" variante="contour">Horaires</BoutonLien>
          </div>
        </div>
      </Section>
    </>
  );
}
