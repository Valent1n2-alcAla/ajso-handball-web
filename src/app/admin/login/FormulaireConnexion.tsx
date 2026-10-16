'use client';

import { useActionState } from 'react';
import { connexion } from '../actions';

const input = 'w-full bg-papier border-2 border-transparent focus:border-violet outline-none px-4 py-3';

export default function FormulaireConnexion() {
  const [etat, action, enCours] = useActionState(connexion, {});
  return (
    <form action={action} className="space-y-5">
      <label className="block">
        <span className="font-mono text-[11px] uppercase tracking-widest text-nuit/60">Email</span>
        <input name="email" type="email" required autoComplete="username" defaultValue={etat.valeurs?.email as string | undefined} className={input} />
      </label>
      <label className="block">
        <span className="font-mono text-[11px] uppercase tracking-widest text-nuit/60">Mot de passe</span>
        <input name="password" type="password" required autoComplete="current-password" className={input} />
      </label>
      {etat.erreur && <p className="text-rose-600 text-sm" role="alert">{etat.erreur}</p>}
      <button type="submit" disabled={enCours} className="w-full bg-losange text-white font-display uppercase tracking-wider text-lg py-3.5 disabled:opacity-60">
        {enCours ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}
