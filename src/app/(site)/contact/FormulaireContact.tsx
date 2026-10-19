'use client';

import { useActionState } from 'react';
import { envoyerMessage, type EtatContact } from './actions';

const input = 'mt-1 w-full bg-white border border-[#8b90a8] focus:border-bande focus:outline-2 focus:outline-bande px-3 py-2.5 text-nuit';

export default function FormulaireContact({ sujetInitial = '' }: { sujetInitial?: string }) {
  const [etat, action, enCours] = useActionState<EtatContact, FormData>(envoyerMessage, { ok: false });

  if (etat.ok) {
    return (
      <div className="bg-bande-clair border-l-4 border-bande p-6" role="status">
        <p className="font-display text-2xl uppercase text-nuit mb-1">Message envoyé !</p>
        <p>{etat.message}</p>
      </div>
    );
  }

  const val = (k: string) => etat.valeurs?.[k];
  const err = (k: string) => etat.erreurs?.[k] && <p id={`erreur-${k}`} className="text-defaite text-sm mt-1">{etat.erreurs[k]}</p>;
  /** Lie le champ à son message d'erreur pour les lecteurs d'écran. */
  const aria = (k: string) => (etat.erreurs?.[k] ? { 'aria-invalid': true, 'aria-describedby': `erreur-${k}` } : {});

  return (
    <form action={action} className="space-y-5" noValidate>
      <div className="hidden" aria-hidden>
        <label>Site web<input name="site" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <label className="block">
          <span className="text-[14px] font-semibold text-nuit">Nom *</span>
          <input name="nom" required maxLength={100} autoComplete="name" {...aria('nom')} defaultValue={val('nom')} className={input} />
          {err('nom')}
        </label>
        <label className="block">
          <span className="text-[14px] font-semibold text-nuit">Email *</span>
          <input name="email" type="email" required maxLength={180} autoComplete="email" {...aria('email')} defaultValue={val('email')} className={input} />
          {err('email')}
        </label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <label className="block">
          <span className="text-[14px] font-semibold text-nuit">Téléphone</span>
          <input name="telephone" type="tel" maxLength={30} autoComplete="tel" {...aria('telephone')} defaultValue={val('telephone')} className={input} />
          {err('telephone')}
        </label>
        <label className="block">
          <span className="text-[14px] font-semibold text-nuit">Sujet *</span>
          <input name="sujet" required maxLength={150} {...aria('sujet')} defaultValue={val('sujet') ?? sujetInitial} className={input} list="sujets" />
          <datalist id="sujets">
            <option value="Inscription" /><option value="Séance d'essai" /><option value="Partenariat" /><option value="Bénévolat" />
          </datalist>
          {err('sujet')}
        </label>
      </div>
      <label className="block">
        <span className="text-[14px] font-semibold text-nuit">Message *</span>
        <textarea name="message" required rows={6} maxLength={5000} {...aria('message')} defaultValue={val('message')} className={input} />
        {err('message')}
      </label>
      {etat.message && <p className="text-defaite" role="alert">{etat.message}</p>}
      <button type="submit" disabled={enCours} className="bg-bande text-white font-display uppercase text-lg px-7 py-2.5 hover:bg-bande-fonce disabled:opacity-50">
        {enCours ? 'Envoi…' : 'Envoyer'}
      </button>
    </form>
  );
}
