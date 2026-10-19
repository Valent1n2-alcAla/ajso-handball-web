import { describe, expect, it } from 'vitest';
import { ageEquipe, construireNav, familleEquipe, reseauxClub } from '../site';
import { rechercherActualites } from '../recherche';
import type { Actualite, Equipe } from '../types';

const equipe = (id: number, nom: string, categorie: string, tranche: string, championnat = true): Equipe => ({
  id, nom, estAjso: true, ordre: id,
  categorie: { id, nom: categorie, tranche: { id: 1, nom: tranche } },
  championnat: championnat ? { id: 9, nom: 'Champ', niveau: 'Région' } : null,
});

const equipes = [
  equipe(1, 'Séniors Masculin A', 'Séniors Masculins', 'Adultes'),
  equipe(2, 'Séniors Féminines', 'Séniors Féminines', 'Adultes'),
  equipe(3, '-15 Garçons', '-15 Garçons', 'Jeunes'),
  equipe(4, 'BabyHAND', 'Babyhand', 'École de hand', false),
  equipe(5, '-17 Feminines', '-17 Féminines', 'Jeunes'),
];

describe('menu des équipes', () => {
  it('range chaque équipe dans sa famille', () => {
    expect(equipes.map(familleEquipe)).toEqual(['seniors-m', 'seniors-f', 'jeunes', 'jeunes', 'jeunes']);
  });

  it('ordonne les jeunes des plus âgés au Baby hand', () => {
    expect(ageEquipe(equipes[2]).libelle).toBe('-15 ans');
    const jeunes = construireNav(equipes).find((r) => r.label === 'Équipes jeunes');
    expect(jeunes?.type === 'panneau' && jeunes.colonnes.map((c) => c.titre)).toEqual(['-17 ans', '-15 ans', 'Baby hand']);
  });

  it('ne propose le classement que pour une équipe en championnat', () => {
    const nav = construireNav(equipes);
    const jeunes = nav.find((r) => r.label === 'Équipes jeunes');
    const baby = jeunes?.type === 'panneau' ? jeunes.colonnes.at(-1)?.equipes[0] : undefined;
    expect(baby?.liens.map((l) => l.href)).toEqual(['/equipes/4#presentation', '/equipes/4#effectif', '/equipes/4#calendrier']);
    expect(nav.map((r) => r.label)).toEqual(['Contact', 'Actu', 'Séniors masculins', 'Séniors féminines', 'Équipes jeunes', 'Club', 'Partenaires']);
  });
});

describe('réseaux sociaux', () => {
  it('reconnaît les réseaux et ignore le reste', () => {
    expect(reseauxClub({ facebook: 'https://www.facebook.com/ajso', instagram: null, reseaux: 'YouTube : https://youtube.com/@ajso, site https://exemple.fr' }))
      .toEqual([{ nom: 'Facebook', href: 'https://www.facebook.com/ajso' }, { nom: 'YouTube', href: 'https://youtube.com/@ajso' }]);
    expect(reseauxClub(null)).toEqual([]);
  });
});

describe('recherche des actualités', () => {
  const a = (id: number, titre: string): Actualite => ({ id, titre, contenu: '', datePub: '2026-10-01' });
  it('ignore la casse et les accents, tous les mots requis', () => {
    const actus = [a(1, 'Belle victoire des Séniors A'), a(2, 'Tournoi Baby Hand')];
    expect(rechercherActualites(actus, 'seniors VICTOIRE').map((x) => x.id)).toEqual([1]);
    expect(rechercherActualites(actus, 'seniors baby')).toEqual([]);
  });
});
