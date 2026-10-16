import { JOURS } from './format';

export type Champ = {
  nom: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'time' | 'datetime-local' | 'url' | 'email' | 'checkbox' | 'select' | 'select-int' | 'relation';
  requis?: boolean;
  aide?: string;
  options?: [string, string][];
  /** Pour type relation : endpoint listant les choix + propriété affichée */
  source?: string;
  large?: boolean;
};

export type Colonne = { chemin: string; label: string; type?: 'bool' | 'jour' | 'score' | 'date' };

export type Ressource = {
  endpoint: string;
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
      { nom: 'image', label: "URL de l'image", type: 'url', aide: 'Lien vers une photo (hébergée sur le site ou ailleurs).' },
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
      { nom: 'photo', label: 'URL photo', type: 'url', large: true },
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
      { nom: 'logo', label: 'URL du logo', type: 'url' },
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
      { nom: 'presentation', label: 'Présentation', type: 'textarea', large: true },
    ],
  },
};

export const MENU_ADMIN: { titre: string; cles: string[] }[] = [
  { titre: 'Saison', cles: ['rencontres', 'actualites', 'equipes', 'creneaux'] },
  { titre: 'Club', cles: ['club', 'partenaires', 'tarifs', 'gymnases'] },
  { titre: 'Référentiels', cles: ['categories', 'championnats', 'tranches'] },
];
