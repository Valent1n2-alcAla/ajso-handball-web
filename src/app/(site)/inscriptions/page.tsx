import type { Metadata } from 'next';
import ListeDocuments from '@/components/Documents';
import { BoutonLien, Chevron, CONTENEUR, Section, TitrePage, Vide } from '@/components/ui';
import { getClub, getDocuments, getTarifs } from '@/lib/api';
import { aujourdhuiParis, formatPrix } from '@/lib/format';
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
      <TitrePage titre="Inscriptions et licences">
        Filles et garçons dès 3 ans, débutants ou confirmés : il y a une place pour toi chez les Ratons.
      </TitrePage>
      <div className={`${CONTENEUR} pt-4 flex flex-wrap gap-3`}>
        <BoutonLien href="#preinscription">Se préinscrire<Chevron className="w-2 h-2.5" /></BoutonLien>
        {documents.length > 0 && <BoutonLien href="#documents" variante="nuit">Documents</BoutonLien>}
      </div>

      <Section titre="Comment s'inscrire ?">
        <ol className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {ETAPES.map(([t, d], i) => (
            <li key={t} className="border border-filet border-t-4 border-t-bande p-4">
              <h3 className="font-display text-xl uppercase text-nuit mb-1"><span className="text-bande mr-2">{i + 1}.</span>{t}</h3>
              <p className="text-[14px]">{d}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section titre="Tarifs">
        {tarifs.length === 0 ? <Vide>Tarifs de la saison bientôt disponibles.</Vide> : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14.5px] border border-filet">
              <caption className="sr-only">Tarifs des licences</caption>
              <thead>
                <tr className="bg-bande text-white font-display uppercase text-[15px] text-left">
                  <th scope="col" className="py-2 px-3">Catégorie</th>
                  <th scope="col" className="py-2 px-3">Années de naissance</th>
                  <th scope="col" className="py-2 px-3 text-right">Tarif</th>
                  <th scope="col" className="py-2 px-3"><span className="sr-only">Paiement</span></th>
                </tr>
              </thead>
              <tbody>
                {tarifs.map((t) => (
                  <tr key={t.id} className="border-b border-filet even:bg-papier align-top">
                    <th scope="row" className="py-2.5 px-3 text-left font-semibold text-nuit">
                      {t.categorie}
                      {t.details && <span className="block font-normal text-[13px] text-encre/80">{t.details}</span>}
                    </th>
                    <td className="py-2.5 px-3">{t.anneesNaissance ?? '–'}</td>
                    <td className="py-2.5 px-3 text-right font-display text-xl text-bande whitespace-nowrap">{formatPrix(t.prix)}</td>
                    <td className="py-2.5 px-3 text-right">
                      {t.helloassoUrl && (
                        <a href={t.helloassoUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-display uppercase text-bande-fonce hover:underline whitespace-nowrap">
                          Payer en ligne <IconeExterne /><span className="sr-only">(HelloAsso, nouvel onglet)</span>
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {club?.helloassoUrl && (
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-nuit text-white p-5">
            <div>
              <p className="font-display text-xl uppercase">Adhésion en ligne</p>
              <p className="text-white/85 text-[14px]">Réglez votre cotisation en ligne sur la page HelloAsso du club.</p>
            </div>
            <BoutonLien href={club.helloassoUrl} variante="jaune" externe>Adhérer sur HelloAsso <IconeExterne /><span className="sr-only">(nouvel onglet)</span></BoutonLien>
          </div>
        )}
        <ul className="liste-chevrons text-[14px] mt-4"><li>Réduction famille à partir du 2ᵉ licencié. Contactez-nous pour toute situation particulière.</li></ul>
      </Section>

      <Section id="preinscription" titre="Préinscription" className="scroll-mt-4">
        <p className="max-w-2xl text-[15px] mb-6">Laissez-nous vos coordonnées : le club vous recontacte pour fixer les séances d&apos;essai et vous transmettre le lien de licence.</p>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-x-10 gap-y-8 items-start">
          <FormulairePreinscription categories={categories} aujourdhui={aujourdhuiParis()} />
          <aside className="border border-filet">
            <h3 className="bg-bande text-white font-display uppercase text-lg px-4 py-2">Et ensuite&nbsp;?</h3>
            <ol className="p-4 space-y-3 text-[14.5px]">
              {['Le club reçoit votre demande et vous recontacte.', "Deux séances d'essai gratuites sur le créneau de la catégorie.", "Licence en ligne via le lien Gest'Hand envoyé par le club."].map((e, i) => (
                <li key={e} className="flex gap-3">
                  <span className="font-display text-xl text-bande leading-none w-5 shrink-0">{i + 1}.</span>
                  <span>{e}</span>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </Section>

      {documents.length > 0 && (
        <Section id="documents" titre="Documents" className="scroll-mt-4">
          <ListeDocuments documents={documents} />
        </Section>
      )}

      <Section>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-bande text-white p-6">
          <div>
            <h2 className="font-display text-2xl uppercase">Une question&nbsp;?</h2>
            <p className="text-[14.5px] mt-1">Le bureau vous répond rapidement.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <BoutonLien href="/contact?sujet=Inscription" variante="nuit">Contact</BoutonLien>
            <BoutonLien href="/entrainements" variante="contour">Horaires</BoutonLien>
          </div>
        </div>
      </Section>
    </>
  );
}
