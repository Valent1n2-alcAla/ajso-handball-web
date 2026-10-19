import { describe, expect, it } from 'vitest';
import { validerPreinscription } from '../preinscription';

const AUJ = '2026-10-19';
const valide = {
  prenom: ' Léa ', nom: 'Martin', dateNaissance: '2014-05-02', email: 'lea@example.org', telephone: '06 12 34 56 78',
};

describe('validerPreinscription', () => {
  it('accepte une saisie complète et normalise', () => {
    const { donnees, erreurs } = validerPreinscription({ ...valide, sexe: 'F', dejaLicencie: 'on', categorieSouhaitee: '', message: ' ' }, AUJ);
    expect(erreurs).toEqual({});
    expect(donnees).toEqual({
      prenom: 'Léa', nom: 'Martin', dateNaissance: '2014-05-02', sexe: 'F', email: 'lea@example.org', telephone: '06 12 34 56 78',
      categorieSouhaitee: null, dejaLicencie: true, message: null,
    });
  });

  it('signale les champs requis', () => {
    const { erreurs } = validerPreinscription({}, AUJ);
    expect(Object.keys(erreurs).sort()).toEqual(['dateNaissance', 'email', 'nom', 'prenom', 'telephone']);
  });

  it('date de naissance passée et réelle', () => {
    expect(validerPreinscription({ ...valide, dateNaissance: AUJ }, AUJ).erreurs.dateNaissance).toMatch(/passée/);
    expect(validerPreinscription({ ...valide, dateNaissance: '2027-01-01' }, AUJ).erreurs.dateNaissance).toMatch(/passée/);
    expect(validerPreinscription({ ...valide, dateNaissance: '2015-02-31' }, AUJ).erreurs.dateNaissance).toBe('Date de naissance invalide.');
    expect(validerPreinscription({ ...valide, dateNaissance: '02/05/2014' }, AUJ).erreurs.dateNaissance).toBe('Date de naissance invalide.');
    expect(validerPreinscription({ ...valide, dateNaissance: '1900-01-01' }, AUJ).erreurs.dateNaissance).toBe('Date de naissance invalide.');
  });

  it('téléphone et email', () => {
    expect(validerPreinscription({ ...valide, telephone: '+33 (0)6.12-34' }, AUJ).erreurs.telephone).toBeUndefined();
    expect(validerPreinscription({ ...valide, telephone: '12345' }, AUJ).erreurs.telephone).toBeDefined();
    expect(validerPreinscription({ ...valide, telephone: '06 12 ab' }, AUJ).erreurs.telephone).toBeDefined();
    expect(validerPreinscription({ ...valide, email: 'lea@' }, AUJ).erreurs.email).toBeDefined();
  });

  it('sexe facultatif mais contrôlé, longueurs maximales', () => {
    expect(validerPreinscription({ ...valide, sexe: '' }, AUJ).donnees.sexe).toBeNull();
    expect(validerPreinscription({ ...valide, sexe: 'X' }, AUJ).erreurs.sexe).toBeDefined();
    expect(validerPreinscription({ ...valide, nom: 'x'.repeat(81) }, AUJ).erreurs.nom).toBe('80 caractères maximum.');
    expect(validerPreinscription({ ...valide, message: 'x'.repeat(2001) }, AUJ).erreurs.message).toBe('2000 caractères maximum.');
  });
});
