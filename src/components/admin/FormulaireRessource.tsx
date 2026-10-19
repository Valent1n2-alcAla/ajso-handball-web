'use client';

import { useActionState } from 'react';
import type { EtatFormulaire } from '@/app/admin/actions';
import type { Champ } from '@/lib/admin-ressources';
import ChampImage from './ChampImage';

export type Option = { valeur: string; libelle: string };

const input = 'w-full bg-white border border-nuit/15 focus:border-violet focus:ring-2 focus:ring-violet/20 outline-none px-3 py-2.5';

export default function FormulaireRessource({ champs, valeurs, options, action }: {
  champs: Champ[];
  valeurs: Record<string, string | boolean | string[]>;
  options: Record<string, Option[]>;
  action: (prev: EtatFormulaire, fd: FormData) => Promise<EtatFormulaire>;
}) {
  const [etat, soumettre, enCours] = useActionState(action, {});

  return (
    <form action={soumettre} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
      {champs.map((c) => {
        const v = etat.valeurs ? etat.valeurs[c.nom] : valeurs[c.nom];
        const erreur = etat.erreurs?.[c.nom];
        const commun = { name: c.nom, id: c.nom, required: c.requis, 'aria-invalid': !!erreur };

        let controle;
        if (c.type === 'checkbox') {
          controle = (
            <label className="flex items-center gap-3 py-2.5 cursor-pointer">
              <input type="checkbox" {...commun} required={false} defaultChecked={v === true} className="w-5 h-5 accent-violet" />
              <span>{c.label}</span>
            </label>
          );
        } else if (c.type === 'relations') {
          const coches = Array.isArray(v) ? v : [];
          controle = (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 border border-nuit/15 bg-white p-3 max-h-60 overflow-y-auto">
              {(options[c.nom] ?? []).map((o) => (
                <label key={o.valeur} className="flex items-center gap-2 py-1 cursor-pointer text-sm">
                  <input type="checkbox" name={c.nom} value={o.valeur} defaultChecked={coches.includes(o.valeur)} className="w-4 h-4 accent-violet" />
                  {o.libelle}
                </label>
              ))}
            </div>
          );
        } else if (c.type === 'image') {
          controle = <ChampImage nom={c.nom} valeur={String(v ?? '')} />;
        } else if (c.type === 'textarea') {
          controle = <textarea {...commun} defaultValue={String(v ?? '')} rows={8} className={input} />;
        } else if (c.type === 'relation' || c.type === 'select' || c.type === 'select-int') {
          const opts = c.type === 'relation' ? options[c.nom] ?? [] : (c.options ?? []).map(([valeur, libelle]) => ({ valeur, libelle }));
          controle = (
            <select {...commun} defaultValue={String(v ?? '')} className={input}>
              <option value="">— Choisir —</option>
              {opts.map((o) => <option key={o.valeur} value={o.valeur}>{o.libelle}</option>)}
            </select>
          );
        } else {
          controle = <input type={c.type} {...commun} step={c.pas} defaultValue={String(v ?? '')} className={input} />;
        }

        return (
          <div key={c.nom} className={c.large || c.type === 'textarea' ? 'md:col-span-2' : ''}>
            {c.type !== 'checkbox' && (
              <label htmlFor={c.nom} className="block font-mono text-[11px] uppercase tracking-widest text-nuit/60 mb-1.5">
                {c.label}{c.requis && ' *'}
              </label>
            )}
            {controle}
            {c.aide && <p className="text-xs text-nuit/50 mt-1">{c.aide}</p>}
            {erreur && <p className="text-sm text-rose-600 mt-1">{erreur}</p>}
          </div>
        );
      })}

      <div className="md:col-span-2 flex items-center gap-4 pt-4 border-t border-nuit/10">
        <button type="submit" disabled={enCours} className="bg-violet text-white font-display uppercase tracking-wider px-7 py-3 hover:bg-roi disabled:opacity-50">
          {enCours ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        {etat.erreur && <p className="text-rose-600" role="alert">{etat.erreur}</p>}
      </div>
    </form>
  );
}
