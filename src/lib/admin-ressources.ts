import { JOURS } from './format';

export type Champ = {
  nom: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'time' | 'datetime-local' | 'url' | 'email' | 'checkbox' | 'select' | 'select-int' | 'relation' | 'image';
  requis?: boolean;
  aide?: string;
  options?: [string, string][];
  /** Pour type relation : endpoint listant les choix + propriété affichée */
  source?: string;
  large?: boolean;
  /** Pas des champs nombre (0.01 pour un prix) */
  pas?: number;
  /** Valeur par défaut d'une case à cocher à la création */
  defaut?: boolean;
};

export type Colonne = { chemin: string; label: string; type?: 'bool' | 'jour' | 'score' | 'date' };

export type Ressource = {
  endpoint: string;
  /** Endpoint de lecture admin, s'il diffère (ex. nom complet des joueurs) */
  lecture?: string;
  /** Filtres acceptés dans l'URL de la liste (?equipe=…) */
  filtres?: string[];
  titre: string;
  singulier: string;
  colonnes: Colonne[];
  champs: Champ[];
  /** Ressource à exemplaire unique (pas de création ni suppression) */
  unique?: boolean;
};

export const RESSOURCES: Record<string, Ressource> = {
  rencontres: {
    endpoint: '/api/rencontres',
    titre: 'Matchs',
    singulier: 'match',
    colonnes: [
      { chemin: 'date', label: 'Date', type: 'date' },
      { chemin: 'equipe.nom', label: 'Équipe AJSO' },
      { chemin: 'equipeAdverse.nom', label: 'Adversaire' },
      { chemin: 'domicile', label: 'Domicile', type: 'bool' },
      { chemin: 'scoreDom', label: 'Score', type: 'score' },
    ],
    champs: [
      { nom: 'equipe', label: 'Équipe AJSO', type: 'relation', source: '/api/equipes?estAjso=true', requis: true },
      { nom: 'equipeAdverse', label: 'Adversaire', type: 'relation', source: '/api/equipes?estAjso=false', requis: true, aide: "Créez l'adversaire dans « Équipes » (case « équipe du club » décochée) s'il n'existe pas." },
      { nom: 'date', label: 'Date (ou samedi du week-end)', type: 'date', requis: true },
      { nom: 'dateConfirmee', label: 'Jour exact confirmé (décocher si seul le week-end est connu)', type: 'checkbox' },
      { nom: 'heure', label: 'Heure', type: 'time', aide: 'Laisser vide si inconnue.' },
      { nom: 'journee', label: 'Journée', type: 'text', aide: 'Ex. J3, Coupe 1er tour' },
      { nom: 'lieu', label: 'Lieu', type: 'text', requis: true },
      { nom: 'domicile', label: "Match à domicile (l'AJSO reçoit)", type: 'checkbox' },
      { nom: 'scoreDom', label: 'Score équipe qui reçoit', type: 'number', aide: 'Laisser vide tant que le match n\'est pas joué.' },
      { nom: 'scoreExt', label: 'Score équipe visiteuse', type: 'number' },
    ],
  },
  actualites: {
    endpoint: '/api/actualites',
    titre: 'Actualités',
    singulier: 'article',
    colonnes: [
      { chemin: 'datePub', label: 'Publication', type: 'date' },
      { chemin: 'titre', label: 'Titre' },
    ],
    champs: [
      { nom: 'titre', label: 'Titre', type: 'text', requis: true, large: true },
      { nom: 'datePub', label: 'Date de publication', type: 'datetime-local', requis: true },
      { nom: 'image', label: 'Image', type: 'image' },
      { nom: 'extrait', label: 'Chapeau / résumé', type: 'text', large: true },
      { nom: 'contenu', label: 'Contenu', type: 'textarea', requis: true, large: true, aide: 'Séparez les paragraphes par une ligne vide.' },
    ],
  },
  equipes: {
    endpoint: '/api/equipes',
    titre: 'Équipes',
    singulier: 'équipe',
    colonnes: [
      { chemin: 'nom', label: 'Nom' },
      { chemin: 'estAjso', label: 'Club', type: 'bool' },
      { chemin: 'categorie.nom', label: 'Catégorie' },
      { chemin: 'championnat.nom', label: 'Championnat' },
    ],
    champs: [
      { nom: 'nom', label: 'Nom', type: 'text', requis: true },
      { nom: 'estAjso', label: "Équipe du club (décocher pour un adversaire)", type: 'checkbox' },
      { nom: 'categorie', label: 'Catégorie', type: 'relation', source: '/api/categories' },
      { nom: 'championnat', label: 'Championnat', type: 'relation', source: '/api/championnats' },
      { nom: 'entraineur', label: 'Entraîneur', type: 'text' },
      { nom: 'ordre', label: "Ordre d'affichage", type: 'number' },
      { nom: 'photo', label: "Photo d'équipe", type: 'image', large: true },
      { nom: 'nomFfhb', label: 'Nom sur ffhandball.fr', type: 'text', aide: 'Libellé exact du site fédéral (ex. « AJS OUISTREHAM HANDBALL 2 »), pour l\'import automatique.' },
      { nom: 'description', label: 'Description', type: 'textarea', large: true },
    ],
  },
  creneaux: {
    endpoint: '/api/creneaux',
    titre: 'Entraînements',
    singulier: 'créneau',
    colonnes: [
      { chemin: 'jour', label: 'Jour', type: 'jour' },
      { chemin: 'heureDebut', label: 'Début' },
      { chemin: 'heureFin', label: 'Fin' },
      { chemin: 'equipe.nom', label: 'Équipe' },
      { chemin: 'gymnase.nom', label: 'Gymnase' },
    ],
    champs: [
      { nom: 'equipe', label: 'Équipe', type: 'relation', source: '/api/equipes?estAjso=true', requis: true },
      { nom: 'gymnase', label: 'Gymnase', type: 'relation', source: '/api/gymnases', requis: true },
      { nom: 'jour', label: 'Jour', type: 'select-int', requis: true, options: JOURS.slice(1).map((j, i) => [String(i + 1), j]) },
      { nom: 'heureDebut', label: 'Début', type: 'time', requis: true },
      { nom: 'heureFin', label: 'Fin', type: 'time', requis: true },
    ],
  },
  gymnases: {
    endpoint: '/api/gymnases',
    titre: 'Gymnases',
    singulier: 'gymnase',
    colonnes: [{ chemin: 'nom', label: 'Nom' }, { chemin: 'adresse', label: 'Adresse' }, { chemin: 'ville', label: 'Ville' }],
    champs: [
      { nom: 'nom', label: 'Nom', type: 'text', requis: true },
      { nom: 'adresse', label: 'Adresse', type: 'text', requis: true },
      { nom: 'codePostal', label: 'Code postal', type: 'text' },
      { nom: 'ville', label: 'Ville', type: 'text' },
    ],
  },
  partenaires: {
    endpoint: '/api/partenaires',
    titre: 'Partenaires',
    singulier: 'partenaire',
    colonnes: [{ chemin: 'nom', label: 'Nom' }, { chemin: 'niveau', label: 'Niveau' }, { chemin: 'ordre', label: 'Ordre' }],
    champs: [
      { nom: 'nom', label: 'Nom', type: 'text', requis: true },
      { nom: 'niveau', label: 'Niveau', type: 'select', requis: true, options: [['principal', 'Principal'], ['officiel', 'Institutionnel'], ['partenaire', 'Partenaire']] },
      { nom: 'url', label: 'Site web', type: 'url' },
      { nom: 'logo', label: 'Logo', type: 'image' },
      { nom: 'ordre', label: "Ordre d'affichage", type: 'number' },
      { nom: 'description', label: 'Description', type: 'textarea', large: true },
    ],
  },
  tarifs: {
    endpoint: '/api/tarifs',
    titre: 'Tarifs',
    singulier: 'tarif',
    colonnes: [{ chemin: 'categorie', label: 'Catégorie' }, { chemin: 'anneesNaissance', label: 'Années' }, { chemin: 'prix', label: 'Prix (€)' }],
    champs: [
      { nom: 'categorie', label: 'Catégorie', type: 'text', requis: true },
      { nom: 'anneesNaissance', label: 'Années de naissance', type: 'text' },
      { nom: 'prix', label: 'Prix (€)', type: 'number', requis: true },
      { nom: 'ordre', label: "Ordre d'affichage", type: 'number' },
      { nom: 'details', label: 'Détails', type: 'text', large: true },
    ],
  },
  categories: {
    endpoint: '/api/categories',
    titre: 'Catégories',
    singulier: 'catégorie',
    colonnes: [{ chemin: 'nom', label: 'Nom' }, { chemin: 'tranche.nom', label: 'Tranche' }],
    champs: [
      { nom: 'nom', label: 'Nom', type: 'text', requis: true },
      { nom: 'tranche', label: "Tranche d'âge", type: 'relation', source: '/api/tranches' },
    ],
  },
  championnats: {
    endpoint: '/api/championnats',
    titre: 'Championnats',
    singulier: 'championnat',
    colonnes: [{ chemin: 'nom', label: 'Nom' }, { chemin: 'niveau', label: 'Niveau' }],
    champs: [
      { nom: 'nom', label: 'Nom', type: 'text', requis: true },
      { nom: 'niveau', label: 'Niveau', type: 'text', requis: true, aide: 'Ex. Départemental, Régional, National' },
      { nom: 'urlFfhb', label: 'Page de la poule sur ffhandball.fr', type: 'url', large: true, aide: 'Ex. https://www.ffhandball.fr/competitions/saison-2026-2027-22/departemental/…/poule-123456/' },
    ],
  },
  tranches: {
    endpoint: '/api/tranches',
    titre: "Tranches d'âge",
    singulier: 'tranche',
    colonnes: [{ chemin: 'nom', label: 'Nom' }, { chemin: 'ageMin', label: 'Âge min' }, { chemin: 'ageMax', label: 'Âge max' }],
    champs: [
      { nom: 'nom', label: 'Nom', type: 'text', requis: true },
      { nom: 'ageMin', label: 'Âge minimum', type: 'number', requis: true },
      { nom: 'ageMax', label: 'Âge maximum', type: 'number', requis: true },
    ],
  },
  club: {
    endpoint: '/api/clubs',
    titre: 'Infos du club',
    singulier: 'club',
    unique: true,
    colonnes: [{ chemin: 'nom', label: 'Nom' }, { chemin: 'email', label: 'Email' }, { chemin: 'president', label: 'Président' }],
    champs: [
      { nom: 'nom', label: 'Nom', type: 'text', requis: true },
      { nom: 'president', label: 'Président(e)', type: 'text' },
      { nom: 'contact', label: 'Personne à contacter', type: 'text', requis: true },
      { nom: 'email', label: 'Email', type: 'email' },
      { nom: 'telephone', label: 'Téléphone', type: 'text' },
      { nom: 'adresse', label: 'Adresse', type: 'text', requis: true, large: true },
      { nom: 'label', label: 'Label fédéral', type: 'text' },
      { nom: 'facebook', label: 'Page Facebook (URL)', type: 'url' },
      { nom: 'instagram', label: 'Compte Instagram (URL)', type: 'url' },
      { nom: 'boutiqueUrl', label: 'Boutique en ligne (HelloAsso…)', type: 'url' },
      { nom: 'presentation', label: 'Présentation', type: 'textarea', large: true },
    ],
  },
};

Object.assign(RESSOURCES, {
  joueurs: {
    endpoint: '/api/joueurs',
    lecture: '/api/admin/joueurs',
    filtres: ['equipe'],
    titre: 'Effectifs',
    singulier: 'joueur',
    colonnes: [
      { chemin: 'equipe.nom', label: 'Équipe' },
      { chemin: 'numero', label: 'N°' },
      { chemin: 'prenom', label: 'Prénom' },
      { chemin: 'nom', label: 'Nom' },
      { chemin: 'poste', label: 'Poste' },
      { chemin: 'capitaine', label: 'Capitaine', type: 'bool' },
    ],
    champs: [
      { nom: 'equipe', label: 'Équipe', type: 'relation', source: '/api/equipes?estAjso=true', requis: true },
      { nom: 'numero', label: 'Numéro', type: 'number' },
      { nom: 'prenom', label: 'Prénom', type: 'text', requis: true },
      { nom: 'nom', label: 'Nom', type: 'text', requis: true, aide: 'Publié en entier pour les équipes adultes, réduit à l\'initiale pour les jeunes.' },
      { nom: 'poste', label: 'Poste', type: 'select', options: [['gardien', 'Gardien'], ['ailier-gauche', 'Ailier gauche'], ['arriere-gauche', 'Arrière gauche'], ['demi-centre', 'Demi-centre'], ['pivot', 'Pivot'], ['arriere-droit', 'Arrière droit'], ['ailier-droit', 'Ailier droit'], ['polyvalent', 'Polyvalent']] },
      { nom: 'capitaine', label: 'Capitaine', type: 'checkbox', defaut: false },
      { nom: 'photo', label: 'Photo', type: 'image', large: true, aide: 'Uniquement avec accord (des parents pour les mineurs).' },
    ],
  },
  classements: {
    endpoint: '/api/classements',
    titre: 'Classements',
    singulier: 'ligne de classement',
    colonnes: [
      { chemin: 'championnat.nom', label: 'Championnat' },
      { chemin: 'position', label: '#' },
      { chemin: 'equipe', label: 'Équipe' },
      { chemin: 'points', label: 'Pts' },
      { chemin: 'joues', label: 'J' },
    ],
    champs: [
      { nom: 'championnat', label: 'Championnat', type: 'relation', source: '/api/championnats', requis: true },
      { nom: 'position', label: 'Position', type: 'number', requis: true },
      { nom: 'equipe', label: 'Équipe', type: 'text', requis: true },
      { nom: 'estAjso', label: "C'est notre équipe", type: 'checkbox', defaut: false },
      { nom: 'points', label: 'Points', type: 'number' },
      { nom: 'joues', label: 'Joués', type: 'number' },
      { nom: 'gagnes', label: 'Gagnés', type: 'number' },
      { nom: 'nuls', label: 'Nuls', type: 'number' },
      { nom: 'perdus', label: 'Perdus', type: 'number' },
      { nom: 'butsPour', label: 'Buts pour', type: 'number' },
      { nom: 'butsContre', label: 'Buts contre', type: 'number' },
    ],
  },
  albums: {
    endpoint: '/api/albums',
    titre: 'Galerie',
    singulier: 'album',
    colonnes: [
      { chemin: 'date', label: 'Date', type: 'date' },
      { chemin: 'titre', label: 'Titre' },
      { chemin: 'nombrePhotos', label: 'Photos' },
    ],
    champs: [
      { nom: 'titre', label: 'Titre', type: 'text', requis: true },
      { nom: 'date', label: 'Date', type: 'date', requis: true },
      { nom: 'couverture', label: 'Photo de couverture', type: 'image', aide: 'Facultatif : sinon choisissez-en une parmi les photos de l\'album.' },
      { nom: 'description', label: 'Description', type: 'textarea', large: true },
    ],
  },
  evenements: {
    endpoint: '/api/evenements',
    titre: 'Agenda',
    singulier: 'événement',
    colonnes: [
      { chemin: 'debut', label: 'Date', type: 'date' },
      { chemin: 'titre', label: 'Titre' },
      { chemin: 'type', label: 'Type' },
      { chemin: 'lieu', label: 'Lieu' },
    ],
    champs: [
      { nom: 'titre', label: 'Titre', type: 'text', requis: true, large: true },
      { nom: 'type', label: 'Type', type: 'select', requis: true, options: [['tournoi', 'Tournoi'], ['stage', 'Stage'], ['festif', 'Festif'], ['assemblee', 'Vie du club (AG, réunion)'], ['evenement', 'Autre événement']] },
      { nom: 'lieu', label: 'Lieu', type: 'text' },
      { nom: 'debut', label: 'Début', type: 'datetime-local', requis: true },
      { nom: 'fin', label: 'Fin', type: 'datetime-local' },
      { nom: 'lienInscription', label: "Lien d'inscription (HelloAsso, formulaire…)", type: 'url', large: true },
      { nom: 'image', label: 'Affiche / image', type: 'image', large: true },
      { nom: 'description', label: 'Description', type: 'textarea', large: true },
    ],
  },
  produits: {
    endpoint: '/api/produits',
    titre: 'Boutique',
    singulier: 'article',
    colonnes: [
      { chemin: 'nom', label: 'Article' },
      { chemin: 'prix', label: 'Prix (€)' },
      { chemin: 'disponible', label: 'Disponible', type: 'bool' },
    ],
    champs: [
      { nom: 'nom', label: 'Nom', type: 'text', requis: true },
      { nom: 'prix', label: 'Prix (€)', type: 'number', requis: true, pas: 0.01 },
      { nom: 'tailles', label: 'Tailles', type: 'text', aide: 'Ex. 6 ans à XXL' },
      { nom: 'disponible', label: 'Disponible à la vente', type: 'checkbox' },
      { nom: 'ordre', label: "Ordre d'affichage", type: 'number' },
      { nom: 'lien', label: 'Lien de commande (HelloAsso…)', type: 'url', aide: 'Sinon : lien de la boutique du club, ou formulaire de contact.' },
      { nom: 'image', label: 'Photo', type: 'image', large: true },
      { nom: 'description', label: 'Description', type: 'textarea', large: true },
    ],
  },
} satisfies Record<string, Ressource>);

export const MENU_ADMIN: { titre: string; cles: string[] }[] = [
  { titre: 'Saison', cles: ['rencontres', 'classements', 'actualites', 'equipes', 'joueurs', 'creneaux'] },
  { titre: 'Vie du club', cles: ['evenements', 'albums', 'produits'] },
  { titre: 'Club', cles: ['club', 'partenaires', 'tarifs', 'gymnases'] },
  { titre: 'Référentiels', cles: ['categories', 'championnats', 'tranches'] },
];
