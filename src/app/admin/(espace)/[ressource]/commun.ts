import { notFound } from 'next/navigation';
import { listeAdmin } from '@/lib/auth';
import { aujourdhuiParis, formatDateCourte, formatHeure, maintenantParis, nomCompetition } from '@/lib/format';
import { RESSOURCES, type Champ, type Ressource } from '@/lib/admin-ressources';
import type { Joueur, Rencontre } from '@/lib/types';
import type { Option } from '@/components/admin/FormulaireRessource';

export function ressourceOu404(cle: string): Ressource {
  if (!Object.hasOwn(RESSOURCES, cle)) notFound();
  return RESSOURCES[cle];
}

type Item = Record<string, unknown> & { '@id'?: string; id?: number; nom?: string; titre?: string };

const avecQuery = (source: string, query: string) => `${source}${source.includes('?') ? '&' : '?'}${query}`;

/** « sam. 24 oct. 2026 · 18h00 — Séniors A vs Caen (dom.) » */
function libelleMatch(m: Rencontre): string {
  const date = `${formatDateCourte(m.date)} ${m.date.slice(0, 4)}${m.heure ? ` · ${formatHeure(m.heure)}` : ''}`;
  return `${date} — ${m.equipe.nom} vs ${m.equipeAdverse.nom} (${m.domicile ? 'dom.' : 'ext.'})`;
}

/** Choix spécifiques : matchs (à venir d'abord, puis passés du plus récent au plus ancien) ou joueurs par équipe. */
async function optionsSpeciales(c: Champ): Promise<Option[]> {
  if (c.choix === 'rencontres') {
    const auj = aujourdhuiParis();
    const [avenir, passes] = await Promise.all([
      listeAdmin<Rencontre>(avecQuery(c.source!, `date[after]=${auj}&order[date]=asc&order[heure]=asc`)),
      listeAdmin<Rencontre>(avecQuery(c.source!, `date[strictly_before]=${auj}&order[date]=desc`)),
    ]);
    const option = (groupe: string) => (m: Rencontre): Option => ({ valeur: String(m['@id']), libelle: libelleMatch(m), groupe, filtre: String(m.equipe['@id'] ?? m.equipe.id) });
    return [...avenir.map(option('À venir')), ...passes.map(option('Matchs passés'))];
  }
  const joueurs = await listeAdmin<Joueur & { equipe: { '@id'?: string } }>(c.source!);
  return joueurs
    .sort((a, b) => a.equipe.nom.localeCompare(b.equipe.nom) || (a.numero ?? 999) - (b.numero ?? 999) || a.prenom.localeCompare(b.prenom))
    .map((j) => ({
      valeur: String(j['@id']),
      libelle: `${j.numero != null ? `${j.numero} · ` : ''}${j.prenom} ${j.nom ?? ''}`.trim(),
      groupe: j.equipe.nom,
      filtre: String(j.equipe['@id'] ?? j.equipe.id),
    }));
}

/** Charge les listes de choix des champs relation. */
export async function chargerOptions(r: Ressource): Promise<Record<string, Option[]>> {
  const entrees = await Promise.all(
    r.champs.filter((c) => (c.type === 'relation' || c.type === 'relations') && c.source).map(async (c) => {
      if (c.choix) return [c.nom, await optionsSpeciales(c)] as const;
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
    else v[c.nom] = brut == null ? (item ? '' : c.valeurDefaut ?? '') : String(brut);
  }
  return v;
}
