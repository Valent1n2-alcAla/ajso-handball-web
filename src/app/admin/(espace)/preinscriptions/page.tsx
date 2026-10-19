import Link from 'next/link';
import { marquerPreinscription, supprimerPreinscription } from '../../actions';
import BoutonConfirmer from '@/components/admin/BoutonConfirmer';
import { listeAdmin } from '@/lib/auth';
import { aujourdhuiParis, formatDatePub, FUSEAU, parseDate } from '@/lib/format';
import type { Preinscription } from '@/lib/types';

export const metadata = { title: 'Préinscriptions' };

/** Âge révolu à une date donnée (AAAA-MM-JJ). */
function age(naissance: string, auj: string): number {
  const [y, m, d] = naissance.split('-').map(Number);
  const [ay, am, ad] = auj.split('-').map(Number);
  return ay - y - (am < m || (am === m && ad < d) ? 1 : 0);
}

export default async function PreinscriptionsPage({ searchParams }: PageProps<'/admin/preinscriptions'>) {
  const { erreur, vue } = await searchParams;
  const aTraiter = vue !== 'toutes';
  const liste = await listeAdmin<Preinscription>(`/api/preinscriptions${aTraiter ? '?traitee=false' : ''}`);
  const auj = aujourdhuiParis();

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-4xl md:text-5xl uppercase">Préinscriptions</h1>
        <nav className="inline-flex bg-white p-1 text-sm" aria-label="Filtre">
          {[['', 'À traiter'], ['toutes', 'Toutes']].map(([v, l]) => (
            <Link key={v} href={v ? `/admin/preinscriptions?vue=${v}` : '/admin/preinscriptions'} aria-current={(v === 'toutes') !== aTraiter ? 'page' : undefined}
              className={`px-4 py-2 ${(v === 'toutes') !== aTraiter ? 'bg-violet text-white' : 'text-nuit/70 hover:text-nuit'}`}>{l}</Link>
          ))}
        </nav>
      </div>
      <p className="text-sm text-nuit/60 mb-5 max-w-3xl">
        Demandes envoyées depuis la page Inscriptions du site. Recontactez la famille, puis marquez la demande comme traitée.
      </p>
      {erreur && <p className="bg-rose-50 text-rose-700 px-4 py-3 mb-4" role="alert">L&apos;opération a échoué. Réessayez.</p>}
      {liste.length === 0 && <p className="bg-white p-10 text-center text-nuit/40">{aTraiter ? 'Aucune préinscription à traiter.' : 'Aucune préinscription reçue.'}</p>}
      <div className="space-y-3">
        {liste.map((p) => (
          <details key={p.id} className={`bg-white group ${p.traitee ? '' : 'border-l-4 border-violet'}`}>
            <summary className="cursor-pointer px-5 py-4 flex flex-wrap items-center gap-x-4 gap-y-1">
              {!p.traitee && <span className="w-2 h-2 rounded-full bg-violet" aria-label="À traiter" />}
              <span className={p.traitee ? '' : 'font-semibold'}>{p.prenom} {p.nom}</span>
              <span className="text-nuit/60 text-sm">{age(p.dateNaissance.slice(0, 10), auj)} ans{p.categorieSouhaitee ? ` · ${p.categorieSouhaitee}` : ''}</span>
              {p.traitee && <span className="font-mono text-[10px] uppercase tracking-widest bg-emerald-100 text-emerald-800 px-2 py-0.5">Traitée</span>}
              <span className="ml-auto font-mono text-xs text-nuit/40">{new Date(p.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: FUSEAU })}</span>
            </summary>
            <div className="px-5 pb-5 border-t border-nuit/5 pt-4">
              <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 text-sm">
                {[
                  ['Né(e) le', formatDatePub(parseDate(p.dateNaissance).toISOString())],
                  ['Sexe', p.sexe === 'F' ? 'Fille / femme' : p.sexe === 'M' ? 'Garçon / homme' : 'Non précisé'],
                  ['Catégorie souhaitée', p.categorieSouhaitee || '—'],
                  ['Déjà licencié(e)', p.dejaLicencie ? 'Oui' : 'Non'],
                ].map(([l, v]) => (
                  <div key={l}>
                    <dt className="font-mono text-[10px] uppercase tracking-widest text-nuit/50">{l}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-widest text-nuit/50">Contact</dt>
                  <dd>
                    <a href={`mailto:${p.email}?subject=${encodeURIComponent('Inscription AJSO Handball')}`} className="text-roi hover:underline break-all">{p.email}</a>
                    <br />
                    <a href={`tel:${p.telephone.replace(/[^\d+]/g, '')}`} className="text-roi hover:underline">{p.telephone}</a>
                  </dd>
                </div>
              </dl>
              {p.message && <p className="whitespace-pre-line mt-4 bg-papier p-4 text-sm">{p.message}</p>}
              <div className="flex gap-4 mt-5 text-sm">
                <form action={marquerPreinscription.bind(null, String(p.id), !p.traitee)}>
                  <button type="submit" className="text-violet hover:underline">{p.traitee ? 'Remettre à traiter' : 'Marquer comme traitée'}</button>
                </form>
                <form action={supprimerPreinscription.bind(null, String(p.id))}>
                  <BoutonConfirmer message="Supprimer cette préinscription ? Les données personnelles seront effacées." className="text-rose-600 hover:underline">Supprimer</BoutonConfirmer>
                </form>
              </div>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
