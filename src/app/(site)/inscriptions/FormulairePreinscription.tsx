'use client';

import { useActionState } from 'react';
import { envoyerPreinscription, type EtatPreinscription } from './actions';

const input = 'w-full bg-papier border-2 border-transparent focus:border-violet outline-none px-4 py-3.5 text-nuit';
const etiquette = 'font-mono text-[11px] uppercase tracking-widest text-nuit/60';

export default function FormulairePreinscription({ categories, aujourdhui }: { categories: string[]; aujourdhui: string }) {
  const [etat, action, enCours] = useActionState<EtatPreinscription, FormData>(envoyerPreinscription, { ok: false });

  if (etat.ok) {
    return (
      <div className="relative overflow-hidden bg-losange text-white p-8 md:p-10" role="status">
        <span aria-hidden className="absolute -right-10 -top-10 w-40 aspect-square rotate-45 border-[12px] border-white/10" />
        <p className="relative font-display text-3xl md:text-4xl uppercase mb-3">Préinscription envoyée&nbsp;!</p>
        <p className="relative text-white/85 max-w-lg">{etat.message}</p>
      </div>
    );
  }

  const val = (k: string) => etat.valeurs?.[k];
  const err = (k: string) => etat.erreurs?.[k] && <p id={`erreur-${k}`} className="text-rose-600 text-sm mt-1">{etat.erreurs[k]}</p>;
  /** Lie le champ à son message d'erreur pour les lecteurs d'écran. */
  const aria = (k: string) => (etat.erreurs?.[k] ? { 'aria-invalid': true, 'aria-describedby': `erreur-${k}` } : {});
  // La clé remonte le formulaire après une réponse : les valeurs renvoyées redeviennent les valeurs par défaut
  const cle = JSON.stringify(etat.valeurs ?? {});

  return (
    <form key={cle} action={action} className="space-y-5" noValidate>
      <div className="hidden" aria-hidden>
        <label>Site web<input name="site" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <fieldset className="space-y-5">
        <legend className="font-display text-2xl uppercase mb-4">Le joueur ou la joueuse</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <label className="block">
            <span className={etiquette}>Prénom *</span>
            <input name="prenom" required maxLength={80} autoComplete="given-name" {...aria('prenom')} defaultValue={val('prenom')} className={input} />
            {err('prenom')}
          </label>
          <label className="block">
            <span className={etiquette}>Nom *</span>
            <input name="nom" required maxLength={80} autoComplete="family-name" {...aria('nom')} defaultValue={val('nom')} className={input} />
            {err('nom')}
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <label className="block">
            <span className={etiquette}>Date de naissance *</span>
            <input name="dateNaissance" type="date" required max={aujourdhui} {...aria('dateNaissance')} defaultValue={val('dateNaissance')} className={input} />
            {err('dateNaissance')}
          </label>
          <div>
            <span className={etiquette} id="libelle-sexe">Sexe</span>
            <div role="radiogroup" aria-labelledby="libelle-sexe" className="grid grid-cols-3 gap-2 mt-0">
              {[['F', 'Féminin'], ['M', 'Masculin'], ['', 'Non précisé']].map(([v, l]) => (
                <label key={v} className="cursor-pointer">
                  <input type="radio" name="sexe" value={v} defaultChecked={(val('sexe') ?? '') === v} className="peer sr-only" />
                  <span className="block text-center bg-papier border-2 border-transparent px-2 py-3.5 text-sm font-semibold text-nuit/70 peer-checked:border-violet peer-checked:text-nuit peer-focus-visible:outline-3 peer-focus-visible:outline-jaune">{l}</span>
                </label>
              ))}
            </div>
            {err('sexe')}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
          <label className="block">
            <span className={etiquette}>Catégorie souhaitée</span>
            <input name="categorieSouhaitee" maxLength={100} list="categories-souhaitees" {...aria('categorieSouhaitee')} defaultValue={val('categorieSouhaitee')} className={input} placeholder="Si vous la connaissez" />
            <datalist id="categories-souhaitees">{categories.map((c) => <option key={c} value={c} />)}</datalist>
            {err('categorieSouhaitee')}
          </label>
          <label className="flex items-start gap-3 cursor-pointer sm:pt-7">
            <input type="checkbox" name="dejaLicencie" defaultChecked={val('dejaLicencie') === 'on'} className="mt-0.5 w-5 h-5 accent-violet shrink-0" />
            <span>Déjà licencié(e) dans un club de handball</span>
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-5 pt-4">
        <legend className="font-display text-2xl uppercase mb-4">Pour vous recontacter</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <label className="block">
            <span className={etiquette}>Email *</span>
            <input name="email" type="email" required maxLength={180} autoComplete="email" {...aria('email')} defaultValue={val('email')} className={input} />
            {err('email')}
          </label>
          <label className="block">
            <span className={etiquette}>Téléphone *</span>
            <input name="telephone" type="tel" required maxLength={30} autoComplete="tel" {...aria('telephone')} defaultValue={val('telephone')} className={input} />
            {err('telephone')}
          </label>
        </div>
        <label className="block">
          <span className={etiquette}>Message</span>
          <textarea name="message" rows={4} maxLength={2000} {...aria('message')} defaultValue={val('message')} className={input} placeholder="Disponibilités, questions, frères et sœurs à inscrire…" />
          {err('message')}
        </label>
      </fieldset>

      <p className="text-xs text-nuit/55">Les informations transmises servent uniquement au club pour vous recontacter au sujet de l&apos;inscription.</p>
      {etat.message && <p className="text-rose-600" role="alert">{etat.message}</p>}
      <button type="submit" disabled={enCours} className="bg-nuit text-white font-display uppercase tracking-wider text-lg px-8 py-4 hover:bg-roi disabled:opacity-50">
        {enCours ? 'Envoi…' : 'Envoyer la préinscription'}
      </button>
    </form>
  );
}
