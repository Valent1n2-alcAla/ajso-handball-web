'use client';

import { useActionState } from 'react';
import { envoyerMessage, type EtatContact } from './actions';

const input = 'w-full bg-papier border-2 border-transparent focus:border-violet outline-none px-4 py-3.5 text-nuit';

export default function FormulaireContact({ sujetInitial = '' }: { sujetInitial?: string }) {
  const [etat, action, enCours] = useActionState<EtatContact, FormData>(envoyerMessage, { ok: false });

  if (etat.ok) {
    return (
      <div className="bg-losange text-white p-10" role="status">
        <p className="font-display text-3xl uppercase mb-2">Message envoyé !</p>
        <p className="text-white/85">{etat.message}</p>
      </div>
    );
  }

  const val = (k: string) => etat.valeurs?.[k];
  const err = (k: string) => etat.erreurs?.[k] && <p id={`erreur-${k}`} className="text-rose-600 text-sm mt-1">{etat.erreurs[k]}</p>;
  /** Lie le champ à son message d'erreur pour les lecteurs d'écran. */
  const aria = (k: string) => (etat.erreurs?.[k] ? { 'aria-invalid': true, 'aria-describedby': `erreur-${k}` } : {});

  return (
    <form action={action} className="space-y-5" noValidate>
      <div className="hidden" aria-hidden>
        <label>Site web<input name="site" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-widest text-nuit/60">Nom *</span>
          <input name="nom" required maxLength={100} autoComplete="name" {...aria('nom')} defaultValue={val('nom')} className={input} />
          {err('nom')}
        </label>
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-widest text-nuit/60">Email *</span>
          <input name="email" type="email" required maxLength={180} autoComplete="email" {...aria('email')} defaultValue={val('email')} className={input} />
          {err('email')}
        </label>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-widest text-nuit/60">Téléphone</span>
          <input name="telephone" type="tel" maxLength={30} autoComplete="tel" {...aria('telephone')} defaultValue={val('telephone')} className={input} />
          {err('telephone')}
        </label>
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-widest text-nuit/60">Sujet *</span>
          <input name="sujet" required maxLength={150} {...aria('sujet')} defaultValue={val('sujet') ?? sujetInitial} className={input} list="sujets" />
          <datalist id="sujets">
            <option value="Inscription" /><option value="Séance d'essai" /><option value="Partenariat" /><option value="Bénévolat" />
          </datalist>
          {err('sujet')}
        </label>
      </div>
      <label className="block">
        <span className="font-mono text-[11px] uppercase tracking-widest text-nuit/60">Message *</span>
        <textarea name="message" required rows={6} maxLength={5000} {...aria('message')} defaultValue={val('message')} className={input} />
        {err('message')}
      </label>
      {etat.message && <p className="text-rose-600" role="alert">{etat.message}</p>}
      <button type="submit" disabled={enCours} className="bg-nuit text-white font-display uppercase tracking-wider text-lg px-8 py-4 hover:bg-roi disabled:opacity-50">
        {enCours ? 'Envoi…' : 'Envoyer'}
      </button>
    </form>
  );
}
