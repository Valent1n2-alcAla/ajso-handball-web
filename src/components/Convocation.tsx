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
    <article className="bg-white shadow-sm ring-1 ring-nuit/5 flex flex-col">
      <header className="bg-losange text-white px-5 md:px-6 py-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <span className="flex items-center gap-2 font-display uppercase tracking-wider">
          <span aria-hidden className="w-2 h-2 rotate-45 bg-jaune" />
          Convocation
        </span>
        <span className="font-mono text-[11px] uppercase tracking-widest">{r.domicile ? 'À domicile' : 'À l\'extérieur'}{r.journee ? ` · ${r.journee}` : ''}</span>
      </header>

      <div className="px-5 md:px-6 pt-5">
        <h3 className="font-display text-2xl md:text-3xl uppercase leading-tight">
          {nom(recevant(r))} <span className="text-nuit/30">vs</span> {nom(visiteur(r))}
        </h3>
        <p className="font-mono text-sm text-nuit/60 mt-1">
          <span className="capitalize">{formatDateMatch(r)}</span> · <span className="text-roi font-semibold">{formatHoraire(r)}</span>
          {r.lieu && <span className="block sm:inline"><span className="hidden sm:inline"> · </span>{r.lieu}</span>}
        </p>
      </div>

      <div className="mx-5 md:mx-6 mt-5 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 bg-papier border-l-4 border-jaune px-4 py-3">
        <p className="font-display text-4xl leading-none text-nuit">{formatHeure(heureRdv)}</p>
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-violet">Rendez-vous{autreJour ? ` · ${dateRdv}` : ''}</p>
          <p className="font-semibold break-words">{c.lieuRendezVous || r.lieu || 'Lieu précisé par l\'entraîneur'}</p>
        </div>
      </div>

      <div className="px-5 md:px-6 py-5">
        <p className="font-mono text-[11px] uppercase tracking-widest text-nuit/55 mb-3">
          {joueurs.length ? `${joueurs.length} joueur${joueurs.length > 1 ? 's' : ''} convoqué${joueurs.length > 1 ? 's' : ''}` : 'Liste des joueurs à venir'}
        </p>
        {joueurs.length > 0 && (
          <ul className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-x-5 gap-y-2">
            {joueurs.map((j) => (
              <li key={j.id} className="flex items-center gap-3 min-w-0">
                <span aria-hidden className="relative w-8 h-8 shrink-0 flex items-center justify-center">
                  <span aria-hidden className="absolute inset-1 rotate-45 bg-nuit" />
                  <span className="relative font-display text-sm text-white">{j.numero ?? ''}</span>
                </span>
                <span className="truncate">{j.numero != null && <span className="sr-only">Numéro {j.numero} : </span>}{j.nomAffiche}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {c.message && (
        <div className="mt-auto px-5 md:px-6 py-4 border-t border-nuit/10">
          <p className="font-mono text-[10px] uppercase tracking-widest text-violet mb-1">Consignes</p>
          <p className="text-sm text-nuit/80 whitespace-pre-line">{c.message}</p>
        </div>
      )}
    </article>
  );
}
