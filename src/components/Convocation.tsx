import { formatDateMatch, formatHeure, formatHoraire, parseDateHeure, FUSEAU, recevant, visiteur } from '@/lib/format';
import type { Convocation } from '@/lib/types';

const nom = (e: { nom: string; estAjso: boolean }) => (e.estAjso ? `AJSO ${e.nom}` : e.nom);

/** Convocation publiée : match, rendez-vous, joueurs convoqués et consignes. */
export default function CarteConvocation({ c }: { c: Convocation }) {
  const r = c.rencontre;
  const [jourRdv, heureRdv] = c.rendezVous.split('T');
  const autreJour = jourRdv !== r.date.slice(0, 10);
  const joueurs = [...c.joueurs].sort((a, b) => (a.numero ?? 999) - (b.numero ?? 999) || a.nomAffiche.localeCompare(b.nomAffiche));
  const dateRdv = parseDateHeure(c.rendezVous).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: FUSEAU });

  return (
    <article className="border border-filet flex flex-col">
      <header className="bg-bande text-white px-4 py-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <span className="font-display uppercase text-lg">Convocation</span>
        <span className="text-[13px]">{r.domicile ? 'À domicile' : 'À l\'extérieur'}{r.journee ? ` · ${r.journee}` : ''}</span>
      </header>

      <div className="px-4 pt-4">
        <h3 className="font-display text-xl md:text-2xl uppercase leading-tight text-nuit">
          {nom(recevant(r))} <span className="text-encre/60 normal-case">contre</span> {nom(visiteur(r))}
        </h3>
        <p className="text-[14px] text-encre/80 mt-1">
          <span className="capitalize">{formatDateMatch(r)}</span> · <span className="text-bande-fonce font-semibold">{formatHoraire(r)}</span>
          {r.lieu && <span className="block sm:inline"><span className="hidden sm:inline"> · </span>{r.lieu}</span>}
        </p>
      </div>

      <div className="mx-4 mt-4 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 bg-papier border-l-4 border-bande px-4 py-2.5">
        <p className="font-display text-3xl leading-none text-nuit">{formatHeure(heureRdv)}</p>
        <div className="min-w-0">
          <p className="text-[13px] text-bande-fonce font-semibold">Rendez-vous{autreJour ? ` · ${dateRdv}` : ''}</p>
          <p className="font-semibold break-words">{c.lieuRendezVous || r.lieu || 'Lieu précisé par l\'entraîneur'}</p>
        </div>
      </div>

      <div className="px-4 py-4">
        <p className="font-display uppercase text-nuit mb-2">
          {joueurs.length ? `${joueurs.length} joueur${joueurs.length > 1 ? 's' : ''} convoqué${joueurs.length > 1 ? 's' : ''}` : 'Liste des joueurs à venir'}
        </p>
        {joueurs.length > 0 && (
          <ul className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-x-5 gap-y-2">
            {joueurs.map((j) => (
              <li key={j.id} className="flex items-center gap-3 min-w-0">
                <span aria-hidden className="w-7 h-7 shrink-0 flex items-center justify-center bg-nuit font-display text-sm text-white">{j.numero ?? ''}</span>
                <span className="truncate">{j.numero != null && <span className="sr-only">Numéro {j.numero} : </span>}{j.nomAffiche}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {c.message && (
        <div className="mt-auto px-4 py-3 border-t border-filet">
          <p className="font-display uppercase text-bande-fonce">Consignes</p>
          <p className="text-[14px] whitespace-pre-line">{c.message}</p>
        </div>
      )}
    </article>
  );
}
