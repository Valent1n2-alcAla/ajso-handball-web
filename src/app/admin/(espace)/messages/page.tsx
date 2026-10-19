import { marquerMessage, supprimerMessage } from '../../actions';
import BoutonConfirmer from '@/components/admin/BoutonConfirmer';
import { listeAdmin } from '@/lib/auth';
import { FUSEAU } from '@/lib/format';
import type { MessageContact } from '@/lib/types';

export const metadata = { title: 'Messages' };

export default async function MessagesPage({ searchParams }: PageProps<'/admin/messages'>) {
  const { erreur } = await searchParams;
  const messages = await listeAdmin<MessageContact>('/api/message_contacts');

  return (
    <>
      <h1 className="font-display text-4xl md:text-5xl uppercase mb-6">Messages</h1>
      {erreur && <p className="bg-rose-50 text-rose-700 px-4 py-3 mb-4" role="alert">L&apos;opération a échoué. Réessayez.</p>}
      {messages.length === 0 && <p className="bg-white p-10 text-center text-nuit/40">Aucun message reçu.</p>}
      <div className="space-y-3">
        {messages.map((m) => (
          <details key={m.id} className={`bg-white group ${m.lu ? '' : 'border-l-4 border-violet'}`}>
            <summary className="cursor-pointer px-5 py-4 flex flex-wrap items-center gap-x-4 gap-y-1">
              {!m.lu && <span className="w-2 h-2 rounded-full bg-violet" aria-label="Non lu" />}
              <span className={m.lu ? '' : 'font-semibold'}>{m.sujet}</span>
              <span className="text-nuit/50 text-sm">{m.nom}</span>
              <span className="ml-auto font-mono text-xs text-nuit/40">{new Date(m.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: FUSEAU })}</span>
            </summary>
            <div className="px-5 pb-5 border-t border-nuit/5 pt-4">
              <p className="text-sm text-nuit/60 mb-3">
                <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.sujet}`)}`} className="text-roi hover:underline">{m.email}</a>
                {m.telephone && <> · <a href={`tel:${m.telephone}`} className="text-roi hover:underline">{m.telephone}</a></>}
              </p>
              <p className="whitespace-pre-line">{m.message}</p>
              <div className="flex gap-4 mt-5 text-sm">
                <form action={marquerMessage.bind(null, String(m.id), !m.lu)}>
                  <button type="submit" className="text-violet hover:underline">Marquer comme {m.lu ? 'non lu' : 'lu'}</button>
                </form>
                <form action={supprimerMessage.bind(null, String(m.id))}>
                  <BoutonConfirmer message="Supprimer ce message ?" className="text-rose-600 hover:underline">Supprimer</BoutonConfirmer>
                </form>
              </div>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
