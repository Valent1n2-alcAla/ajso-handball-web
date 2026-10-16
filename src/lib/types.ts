export type Ref = { '@id'?: string; id: number };

export type Tranche = Ref & { nom: string; ageMin?: number; ageMax?: number };
export type Categorie = Ref & { nom: string; tranche?: Tranche | null };
export type Championnat = Ref & { nom: string; niveau: string };

export type Equipe = Ref & {
  nom: string;
  estAjso: boolean;
  entraineur?: string | null;
  description?: string | null;
  photo?: string | null;
  ordre?: number;
  categorie?: Categorie | null;
  championnat?: Championnat | null;
};

export type Rencontre = Ref & {
  equipe: Equipe;
  equipeAdverse: Equipe;
  date: string; // Y-m-d
  heure?: string | null; // H:i, null si inconnu
  dateConfirmee?: boolean; // false : seul le week-end est connu (date = samedi)
  journee?: string | null;
  lieu: string;
  domicile: boolean;
  scoreDom?: number | null;
  scoreExt?: number | null;
};

export type Actualite = Ref & {
  titre: string;
  contenu: string;
  extrait?: string | null;
  datePub: string;
  image?: string | null;
};

export type Club = Ref & {
  nom: string;
  adresse: string;
  contact: string;
  reseaux?: string | null;
  email?: string | null;
  telephone?: string | null;
  president?: string | null;
  presentation?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  label?: string | null;
};

export type Gymnase = Ref & { nom: string; adresse: string; ville?: string | null; codePostal?: string | null };

export type Creneau = Ref & {
  equipe: Equipe;
  gymnase: Gymnase;
  jour: number;
  heureDebut: string;
  heureFin: string;
};

export type Partenaire = Ref & {
  nom: string;
  logo?: string | null;
  url?: string | null;
  description?: string | null;
  niveau: 'principal' | 'officiel' | 'partenaire';
  ordre: number;
};

export type Tarif = Ref & {
  categorie: string;
  anneesNaissance?: string | null;
  prix: number;
  details?: string | null;
  ordre: number;
};

export type MessageContact = Ref & {
  nom: string;
  email: string;
  telephone?: string | null;
  sujet: string;
  message: string;
  createdAt: string;
  lu: boolean;
};
