export type Ref = { '@id'?: string; id: number };

export type Tranche = Ref & { nom: string; ageMin?: number; ageMax?: number };
export type Categorie = Ref & { nom: string; tranche?: Tranche | null };
export type TypeCompetition = 'championnat' | 'phase-1' | 'phase-2' | 'coupe';
export type Championnat = Ref & { nom: string; niveau: string; type?: TypeCompetition; urlFfhb?: string | null };

export type Equipe = Ref & {
  nom: string;
  estAjso: boolean;
  entraineur?: string | null;
  description?: string | null;
  photo?: string | null;
  ordre?: number;
  nomFfhb?: string | null;
  /** Club(s) partenaire(s) de l'entente */
  entente?: string | null;
  /** Autres compétitions (phases, coupe) */
  competitions?: Championnat[];
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
  ffhbId?: string | null;
  /** Compétition du match (import FFHB) ; sinon celle de l'équipe */
  championnat?: Championnat | null;
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
  boutiqueUrl?: string | null;
  /** Page HelloAsso du club (adhésions, dons) */
  helloassoUrl?: string | null;
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
  /** Paiement de l'adhésion en ligne (HelloAsso) */
  helloassoUrl?: string | null;
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

export type LigneClassement = Ref & {
  championnat: Championnat;
  position: number;
  equipe: string;
  estAjso: boolean;
  points: number;
  joues: number;
  gagnes: number;
  nuls: number;
  perdus: number;
  butsPour: number;
  butsContre: number;
};

export type Photo = Ref & { url: string; legende?: string | null; ordre: number };

export type Album = Ref & {
  titre: string;
  date: string;
  description?: string | null;
  couverture?: string | null;
  nombrePhotos: number;
  photos?: Photo[];
};

export type Evenement = Ref & {
  titre: string;
  debut: string; // AAAA-MM-JJTHH:MM, heure locale
  fin?: string | null;
  lieu?: string | null;
  type: 'tournoi' | 'stage' | 'festif' | 'assemblee' | 'evenement';
  description?: string | null;
  image?: string | null;
  lienInscription?: string | null;
};

export type Produit = Ref & {
  nom: string;
  description?: string | null;
  prix: number;
  image?: string | null;
  tailles?: string | null;
  lien?: string | null;
  disponible: boolean;
  ordre: number;
};

export type Poste = 'gardien' | 'ailier-gauche' | 'arriere-gauche' | 'demi-centre' | 'pivot' | 'arriere-droit' | 'ailier-droit' | 'polyvalent';

export type Joueur = Ref & {
  equipe: Pick<Equipe, 'id' | 'nom'>;
  prenom: string;
  /** Nom complet en catégorie adultes, « Prénom N. » pour les jeunes (calculé par l'API) */
  nomAffiche: string;
  /** Présent uniquement pour l'admin */
  nom?: string;
  numero?: number | null;
  poste?: Poste | null;
  photo?: string | null;
  capitaine: boolean;
};

export type Participation = Ref & {
  joueur: Joueur;
  /** IRI du match */
  rencontre: string;
  numero?: number | null;
  buts: number;
  buts7m?: number;
  tirs?: number;
  arrets?: number;
  exclusions?: number;
  avertissement?: boolean;
  disqualification?: boolean;
};

/** Match tel qu'embarqué dans une convocation ou une permanence. */
export type RencontreResume = Pick<Rencontre, 'id' | 'date' | 'heure' | 'lieu' | 'domicile' | 'equipe' | 'equipeAdverse' | 'championnat' | 'journee' | 'scoreDom' | 'scoreExt' | 'dateConfirmee'> & { '@id'?: string };

export type Convocation = Ref & {
  rencontre: RencontreResume;
  /** AAAA-MM-JJTHH:MM, heure de Paris */
  rendezVous: string;
  lieuRendezVous?: string | null;
  joueurs: (Ref & { numero?: number | null; nomAffiche: string })[];
  message?: string | null;
  publiee: boolean;
};

export type RolePermanence = 'arbitrage' | 'table' | 'buvette' | 'accueil' | 'autre';

export type Permanence = Ref & {
  rencontre: RencontreResume;
  role: RolePermanence;
  /** Nom(s) du ou des bénévoles ; vide = poste à pourvoir */
  benevole?: string | null;
  /** Nombre de personnes nécessaires (1 à 20) */
  besoin: number;
};

export type CategorieDocument = 'inscription' | 'reglement' | 'assemblee' | 'autre';

export type DocumentClub = Ref & {
  titre: string;
  url: string;
  categorie: CategorieDocument;
  ordre: number;
};

export type Preinscription = Ref & {
  prenom: string;
  nom: string;
  dateNaissance: string;
  sexe?: 'F' | 'M' | null;
  email: string;
  telephone: string;
  categorieSouhaitee?: string | null;
  dejaLicencie: boolean;
  message?: string | null;
  createdAt: string;
  traitee: boolean;
};
