/**
 * Validation de la préinscription, côté site, alignée sur les contraintes de l'API
 * (l'API reste juge : ses erreurs 422 sont aussi affichées champ par champ).
 */

export type DonneesPreinscription = {
  prenom: string;
  nom: string;
  dateNaissance: string;
  sexe: 'F' | 'M' | null;
  email: string;
  telephone: string;
  categorieSouhaitee: string | null;
  dejaLicencie: boolean;
  message: string | null;
};

export type ChampPreinscription = keyof DonneesPreinscription;

export const CHAMPS_PREINSCRIPTION: ChampPreinscription[] = [
  'prenom', 'nom', 'dateNaissance', 'sexe', 'email', 'telephone', 'categorieSouhaitee', 'dejaLicencie', 'message',
];

/** AAAA-MM-JJ correspondant à un vrai jour du calendrier (pas de 31 février). */
function dateExiste(d: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!m) return false;
  const [y, mo, j] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const x = new Date(Date.UTC(y, mo - 1, j));
  return x.getUTCFullYear() === y && x.getUTCMonth() === mo - 1 && x.getUTCDate() === j;
}

const MAX ={ prenom: 80, nom: 80, email: 180, categorieSouhaitee: 100, message: 2000 } as const;

/** Lit et valide les valeurs saisies. `aujourdhui` : AAAA-MM-JJ (heure de Paris). */
export function validerPreinscription(
  brut: Record<string, string | undefined>,
  aujourdhui: string,
): { donnees: DonneesPreinscription; erreurs: Partial<Record<ChampPreinscription, string>> } {
  const t = (k: string) => (brut[k] ?? '').trim();
  const sexe = t('sexe');
  const donnees: DonneesPreinscription = {
    prenom: t('prenom'),
    nom: t('nom'),
    dateNaissance: t('dateNaissance'),
    sexe: sexe === 'F' || sexe === 'M' ? sexe : null,
    email: t('email'),
    telephone: t('telephone'),
    categorieSouhaitee: t('categorieSouhaitee') || null,
    dejaLicencie: ['on', 'true', '1'].includes(t('dejaLicencie')),
    message: t('message') || null,
  };

  const erreurs: Partial<Record<ChampPreinscription, string>> = {};
  if (!donnees.prenom) erreurs.prenom = 'Le prénom est requis.';
  if (!donnees.nom) erreurs.nom = 'Le nom est requis.';

  const d = donnees.dateNaissance;
  if (!d) erreurs.dateNaissance = 'La date de naissance est requise.';
  else if (!dateExiste(d)) erreurs.dateNaissance = 'Date de naissance invalide.';
  else if (d >= aujourdhui) erreurs.dateNaissance = 'La date de naissance doit être passée.';
  else if (Number(d.slice(0, 4)) < Number(aujourdhui.slice(0, 4)) - 100) erreurs.dateNaissance = 'Date de naissance invalide.';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donnees.email)) erreurs.email = 'Adresse email invalide.';
  if (!donnees.telephone) erreurs.telephone = 'Le téléphone est requis.';
  else if (!/^[0-9 +().-]{6,30}$/.test(donnees.telephone)) erreurs.telephone = 'Numéro de téléphone invalide.';
  if (sexe && !donnees.sexe) erreurs.sexe = 'Valeur invalide.';

  for (const [k, max] of Object.entries(MAX) as [keyof typeof MAX, number][]) {
    if ((donnees[k] ?? '').length > max) erreurs[k] = `${max} caractères maximum.`;
  }
  return { donnees, erreurs };
}
