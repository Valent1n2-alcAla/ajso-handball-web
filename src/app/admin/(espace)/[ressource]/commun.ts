import { notFound } from 'next/navigation';
import { listeAdmin } from '@/lib/auth';
import { maintenantParis, nomCompetition } from '@/lib/format';
import { RESSOURCES, type Ressource } from '@/lib/admin-ressources';
import type { Option } from '@/components/admin/FormulaireRessource';

export function ressourceOu404(cle: string): Ressource {
  if (!Object.hasOwn(RESSOURCES, cle)) notFound();
  return RESSOURCES[cle];
}

type Item = Record<string, unknown> & { '@id'?: string; id?: number; nom?: string; titre?: string };

/** Charge les listes de choix des champs relation. */
export async function chargerOptions(r: Ressource): Promise<Record<string, Option[]>> {
  const entrees = await Promise.all(
    r.champs.filter((c) => (c.type === 'relation' || c.type === 'relations') && c.source).map(async (c) => {
      const items = await listeAdmin<Item>(c.source!);
      return [c.nom, items.map((i) => ({ valeur: String(i['@id']), libelle: typeof i.type === 'string' && i.nom ? nomCompetition({ nom: i.nom, type: i.type }) : String(i.nom ?? i.titre ?? i.id) }))] as const;
    }),
  );
  return Object.fromEntries(entrees);
}

/** Valeurs initiales du formulaire à partir d'un item de l'API. */
export function valeursInitiales(r: Ressource, item: Item | null): Record<string, string | boolean | string[]> {
  const v: Record<string, string | boolean | string[]> = {};
  for (const c of r.champs) {
    const brut = item?.[c.nom];
    if (c.type === 'checkbox') v[c.nom] = item ? brut === true : c.defaut ?? ['estAjso', 'domicile', 'dateConfirmee', 'disponible'].includes(c.nom);
    else if (c.type === 'relations') v[c.nom] = Array.isArray(brut) ? brut.map((x) => (x && typeof x === 'object' ? String((x as Item)['@id']) : String(x))) : [];
    else if (c.type === 'relation') v[c.nom] = brut && typeof brut === 'object' ? String((brut as Item)['@id']) : String(brut ?? '');
    else if (c.type === 'datetime-local') v[c.nom] = brut ? String(brut).slice(0, 16) : c.requis ? maintenantParis() : '';
    else if (c.type === 'date') v[c.nom] = brut ? String(brut).slice(0, 10) : '';
    else v[c.nom] = brut == null ? '' : String(brut);
  }
  return v;
}
