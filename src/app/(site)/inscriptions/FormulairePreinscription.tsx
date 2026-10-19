'use client';

import { useActionState } from 'react';
import { envoyerPreinscription, type EtatPreinscription } from './actions';

const input = 'mt-1 w-full bg-white border border-[#8b90a8] focus:border-bande focus:outline-2 focus:outline-bande px-3 py-2.5 text-nuit';
const etiquette = 'text-[14px] font-semibold text-nuit';

export default function FormulairePreinscription({ categories, aujourdhui }: { categories: string[]; aujourdhui: string }) {
  const [etat, action, enCours] = useActionState<EtatPreinscription, FormData>(envoyerPreinscription, { ok: false });

  if (etat.ok) {
    return (
      <div className="bg-bande-clair border-l-4 border-bande p-6" role="status">
        <p className="font-display text-2xl uppercase text-nuit mb-1">Préinscription envoyée&nbsp;!</p>
        <p className="max-w-lg">{etat.message}</p>
      </div>
    );
  }

  const val = (k: string) => etat.valeurs?.[k];
  const err = (k: string) => etat.erreurs?.[k] && <p id={`erreur-${k}`} className="text-defaite text-sm mt-1">{etat.erreurs[k]}</p>;
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
        <legend className="font-display text-xl uppercase text-bande mb-3">Le joueur ou la joueuse</legend>
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
                  <span className="mt-1 block text-center bg-white border border-[#8b90a8] px-2 py-2.5 text-sm font-semibold text-nuit peer-checked:bg-bande peer-checked:border-bande peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:outline-jaune">{l}</span>
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
            <input type="checkbox" name="dejaLicencie" defaultChecked={val('dejaLicencie') === 'on'} className="mt-0.5 w-5 h-5 accent-bande shrink-0" />
            <span>Déjà licencié(e) dans un club de handball</span>
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-5 pt-4">
        <legend className="font-display text-xl uppercase text-bande mb-3">Pour vous recontacter</legend>
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

      <p className="text-[13px] text-encre/75">Les informations transmises servent uniquement au club pour vous recontacter au sujet de l&apos;inscription.</p>
      {etat.message && <p className="text-defaite" role="alert">{etat.message}</p>}
      <button type="submit" disabled={enCours} className="bg-bande text-white font-display uppercase text-lg px-7 py-2.5 hover:bg-bande-fonce disabled:opacity-50">
        {enCours ? 'Envoi…' : 'Envoyer la préinscription'}
      </button>
    </form>
  );
}
