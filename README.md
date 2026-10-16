# AJSO Handball — Site web

Site officiel de l'AJS Ouistreham Handball : Next.js 16 (App Router) + Tailwind CSS 4,
alimenté par l'API Symfony [`ajso-handball-api`](https://github.com/Valent1n2-alcAla/ajso-handball-api).

## Pages

- **Public** : accueil, équipes (+ fiche équipe), calendrier & résultats (filtres), actualités (+ article),
  entraînements, le club (valeurs, bureau, gymnases), partenaires, inscriptions & tarifs, contact, mentions légales.
- **Espace club** `/admin` : tableau de bord, messages de contact, gestion des matchs/scores, actualités,
  équipes, créneaux, infos club, partenaires, tarifs, gymnases, référentiels.

## Direction artistique

Couleurs issues du logo (raton laveur dans losange) définies dans `src/app/globals.css` :
bleu nuit `#0a0f3c`, bleu roi `#2340c8`, violet `#6b2fa8`, bleu glacier `#9fd8ff`, accent jaune `#ffc629`.
Typos : Anton (titres), Barlow (texte), IBM Plex Mono (infos).

Le logo est une recréation vectorielle (`public/logo-ajso.svg`). Pour utiliser le fichier original,
déposez-le dans `public/` et modifiez `LOGO_SRC` dans `src/lib/site.ts`.

## Démarrage

```bash
cp .env.example .env.local    # API_URL, SITE_URL
npm install
npm run dev                   # http://localhost:3000 (l'API doit tourner sur API_URL)
```

## Sécurité admin

Connexion via l'API (`/api/login`) ; le JWT est stocké dans un cookie `httpOnly` (`secure` en production)
et n'est jamais exposé au navigateur. Toutes les écritures passent par des Server Actions authentifiées,
l'API vérifie le rôle `ROLE_ADMIN`.
