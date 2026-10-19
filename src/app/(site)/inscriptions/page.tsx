import type { Metadata } from 'next';
import ListeDocuments from '@/components/Documents';
import { BoutonLien, PageHero, Section } from '@/components/ui';
import { getClub, getDocuments, getTarifs } from '@/lib/api';
import { aujourdhuiParis } from '@/lib/format';
import FormulairePreinscription from './FormulairePreinscription';

function IconeExterne() {
  return <svg aria-hidden viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" /></svg>;
}

export const metadata: Metadata = { title: 'Inscriptions & licences', description: "Tarifs des licences, pièces à fournir et démarche d'inscription à l'AJSO Handball." };

const ETAPES = [
  ['Essayer', "Venez faire deux séances d'essai gratuites sur le créneau de votre catégorie."],
  ['Remplir', 'Complétez la licence en ligne via le lien Gest\'Hand envoyé par le club.'],
  ['Fournir', 'Photo, pièce d\'identité, certificat médical ou questionnaire de santé, autorisation parentale pour les mineurs.'],
  ['Régler', 'Paiement en une ou plusieurs fois. Pass\'Sport, chèques ANCV et coupons sport acceptés.'],
];

export default async function InscriptionsPage() {
  const [tarifs, club, documents] = await Promise.all([getTarifs(), getClub(), getDocuments()]);
  const categories = [...new Set(tarifs.map((t) => t.categorie))];

  return (
    <>
      <PageHero surtitre="Rejoindre l'AJSO" titre={<>Inscriptions <span className="text-jaune">&amp;</span> licences</>}>
        Filles et garçons dès 3 ans, débutants ou confirmés : il y a une place pour toi chez les Ratons.
        <div className="flex flex-wrap gap-3 mt-8">
          <BoutonLien href="#preinscription">Se préinscrire</BoutonLien>
          {documents.length > 0 && <BoutonLien href="#documents" variante="contour">Documents</BoutonLien>}
        </div>
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
                  {t.helloassoUrl && (
                    <a href={t.helloassoUrl} target="_blank" rel="noopener noreferrer"
                      className="mt-auto pt-6 self-start inline-flex items-center gap-2 font-display uppercase tracking-wider text-jaune hover:text-white transition-colors">
                      Payer en ligne <IconeExterne /><span className="sr-only">(HelloAsso, nouvel onglet)</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
          {club?.helloassoUrl && (
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border border-jaune/40 bg-white/[0.04] p-6 md:p-7">
              <div>
                <p className="font-display text-2xl uppercase">Adhésion en ligne</p>
                <p className="text-white/65 text-sm mt-1">Réglez votre cotisation en ligne sur la page HelloAsso du club.</p>
              </div>
              <a href={club.helloassoUrl} target="_blank" rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center justify-center gap-2 bg-jaune text-nuit font-display uppercase tracking-wider text-lg px-7 py-3.5 hover:bg-white transition">
                Adhérer sur HelloAsso <IconeExterne /><span className="sr-only">(nouvel onglet)</span>
              </a>
            </div>
          )}
          <p className="text-white/50 text-sm mt-8">Réduction famille à partir du 2ᵉ licencié. Contactez-nous pour toute situation particulière.</p>
        </Section>
      </section>

      <Section id="preinscription" surtitre="Premier contact" titre="Préinscription" className="scroll-mt-24">
        <p className="text-nuit/70 max-w-2xl text-lg -mt-4 mb-10">Laissez-nous vos coordonnées : le club vous recontacte pour fixer les séances d&apos;essai et vous transmettre le lien de licence.</p>
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-x-12 gap-y-10 items-start">
        <FormulairePreinscription categories={categories} aujourdhui={aujourdhuiParis()} />
        <aside className="bg-nuit text-white p-7 md:p-8 motif-losanges lg:sticky lg:top-28">
          <h3 className="font-display text-2xl uppercase mb-5 flex items-center gap-3"><span aria-hidden className="w-3 h-3 rotate-45 bg-jaune" />Et ensuite&nbsp;?</h3>
          <ol className="space-y-4">
            {['Le club reçoit votre demande et vous recontacte.', "Deux séances d'essai gratuites sur le créneau de la catégorie.", "Licence en ligne via le lien Gest'Hand envoyé par le club."].map((e, i) => (
              <li key={e} className="flex gap-4">
                <span className="font-display text-3xl text-jaune leading-none w-6 shrink-0">{i + 1}</span>
                <span className="text-white/80">{e}</span>
              </li>
            ))}
          </ol>
        </aside>
        </div>
      </Section>

      {documents.length > 0 && (
        <section id="documents" className="bg-papier scroll-mt-24">
          <Section surtitre="À télécharger" titre="Documents">
            <ListeDocuments documents={documents} />
          </Section>
        </section>
      )}

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
