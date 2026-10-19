'use client';

import { Fragment, useActionState, useState } from 'react';
import type { EtatFormulaire } from '@/app/admin/actions';
import type { Champ } from '@/lib/admin-ressources';
import ChampFichier from './ChampFichier';
import ChampImage from './ChampImage';

export type Option = {
  valeur: string;
  libelle: string;
  /** Intitulé de groupe (optgroup, titre de bloc de cases) */
  groupe?: string;
  /** Clé de filtrage partagée avec un champ lié (ex. IRI de l'équipe) */
  filtre?: string;
};

/** Options regroupées en conservant l'ordre d'arrivée. */
function grouper(opts: Option[]): [string, Option[]][] {
  const g = new Map<string, Option[]>();
  for (const o of opts) g.set(o.groupe ?? '', [...(g.get(o.groupe ?? '') ?? []), o]);
  return [...g.entries()];
}

/** Cases à cocher multiples, regroupées, éventuellement restreintes à une clé de filtrage (les cases cochées restent visibles). */
function CasesMultiples({ nom, options, coches: initiales, filtre }: { nom: string; options: Option[]; coches: string[]; filtre?: string }) {
  const [coches, setCoches] = useState(() => new Set(initiales));
  const [tous, setTous] = useState(false);
  const visible = (o: Option) => tous || !filtre || o.filtre === filtre || coches.has(o.valeur);
  const masques = options.filter((o) => !visible(o)).length;
  const basculer = (v: string) => setCoches((s) => { const n = new Set(s); if (n.has(v)) n.delete(v); else n.add(v); return n; });

  return (
    <div className="border border-nuit/15 bg-white">
      <div className="p-3 max-h-72 overflow-y-auto space-y-3">
        {options.length === 0 && <p className="text-sm text-nuit/50">Aucun choix disponible.</p>}
        {grouper(options).map(([groupe, opts]) => {
          const affiches = opts.filter(visible);
          if (!affiches.length) return null;
          return (
            <fieldset key={groupe}>
              {groupe && <legend className="font-mono text-[10px] uppercase tracking-widest text-violet mb-1">{groupe}</legend>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                {affiches.map((o) => (
                  <label key={o.valeur} className="flex items-center gap-2 py-1 cursor-pointer text-sm">
                    <input type="checkbox" name={nom} value={o.valeur} checked={coches.has(o.valeur)} onChange={() => basculer(o.valeur)} className="w-4 h-4 accent-violet" />
                    {o.libelle}
                  </label>
                ))}
              </div>
            </fieldset>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-nuit/10 px-3 py-2 text-xs text-nuit/60">
        <span>{coches.size} sélectionné{coches.size > 1 ? 's' : ''}</span>
        {filtre && (masques > 0 || tous) && (
          <button type="button" onClick={() => setTous((t) => !t)} className="text-roi hover:underline">
            {tous ? "Seulement l'équipe du match" : `Afficher les autres équipes (${masques})`}
          </button>
        )}
      </div>
    </div>
  );
}

const input = 'w-full bg-white border border-nuit/15 focus:border-violet focus:ring-2 focus:ring-violet/20 outline-none px-3 py-2.5';

export default function FormulaireRessource({ champs, valeurs, options, action }: {
  champs: Champ[];
  valeurs: Record<string, string | boolean | string[]>;
  options: Record<string, Option[]>;
  action: (prev: EtatFormulaire, fd: FormData) => Promise<EtatFormulaire>;
}) {
  const [etat, soumettre, enCours] = useActionState(action, {});
  // Valeurs suivies des champs dont dépend un autre champ (ex. le match choisi filtre les joueurs)
  const pilotes = champs.map((c) => c.dependDe).filter((x): x is string => !!x);
  const [suivies, setSuivies] = useState<Record<string, string>>(() =>
    Object.fromEntries(pilotes.map((p) => [p, String((etat.valeurs ?? valeurs)[p] ?? '')])),
  );

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
          const filtre = c.dependDe ? (options[c.dependDe] ?? []).find((o) => o.valeur === suivies[c.dependDe!])?.filtre : undefined;
          // La clé remonte le composant si le formulaire revient en erreur avec d'autres cases cochées
          controle = <CasesMultiples key={coches.join(',')} nom={c.nom} options={options[c.nom] ?? []} coches={coches} filtre={filtre} />;
        } else if (c.type === 'image') {
          controle = <ChampImage nom={c.nom} valeur={String(v ?? '')} />;
        } else if (c.type === 'fichier') {
          controle = <ChampFichier nom={c.nom} valeur={String(v ?? '')} requis={c.requis} />;
        } else if (c.type === 'textarea') {
          controle = <textarea {...commun} defaultValue={String(v ?? '')} rows={8} className={input} />;
        } else if (c.type === 'relation' || c.type === 'select' || c.type === 'select-int') {
          const opts: Option[] = c.type === 'relation' ? options[c.nom] ?? [] : (c.options ?? []).map(([valeur, libelle]) => ({ valeur, libelle }));
          const groupes = grouper(opts);
          const suivi = pilotes.includes(c.nom);
          controle = (
            <select {...commun} defaultValue={String(v ?? '')} className={input}
              onChange={suivi ? (e) => { const val = e.target.value; setSuivies((s) => ({ ...s, [c.nom]: val })); } : undefined}>
              <option value="">— Choisir —</option>
              {groupes.map(([g, liste]) => {
                const items = liste.map((o) => <option key={o.valeur} value={o.valeur}>{o.libelle}</option>);
                return g ? <optgroup key={g} label={g}>{items}</optgroup> : <Fragment key="">{items}</Fragment>;
              })}
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
