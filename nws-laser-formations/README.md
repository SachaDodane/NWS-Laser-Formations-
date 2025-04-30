# NWS Laser Formations

Plateforme d'apprentissage en ligne spécialisée dans les formations laser pour les professionnels et les particuliers. Ce projet utilise Next.js, TypeScript, MongoDB et Tailwind CSS pour offrir une expérience d'apprentissage moderne et interactive.

## Fonctionnalités

- **Authentification Sécurisée** : Système de connexion et d'inscription utilisant NextAuth.js
- **Catalogue de Formations** : Affichage et navigation dans les différentes formations disponibles
- **Progression des Cours** : Suivi de la progression de l'utilisateur à travers les chapitres
- **Lecture Vidéo** : Intégration de vidéos YouTube avec lecture optimisée
- **Quiz Interactifs** : Évaluation des connaissances après chaque module
- **Tableau de Bord** : Interface utilisateur pour suivre ses formations et sa progression
- **Panel Admin** : Gestion des cours, utilisateurs et codes promo
- **Paiements** : Intégration d'un système de paiement (à configurer)

## Prérequis

- Node.js 18+ et npm/yarn/pnpm
- MongoDB (local ou instance MongoDB Atlas)
- Compte GitHub (pour authentification OAuth)

## Installation

1. Cloner le dépôt :
```bash
git clone https://github.com/votre-nom/nws-laser-formations.git
cd nws-laser-formations
```

2. Installer les dépendances :
```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. Configurer les variables d'environnement :
   - Copier le fichier `.env.example` vers `.env.local`
   - Remplir les variables requises (MongoDB URI, clés d'API, etc.)

4. Démarrer le serveur de développement :
```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

5. Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur

## Structure du Projet

```
nws-laser-formations/
├── public/                # Ressources statiques
│   ├── images/            # Images des cours et chapitres
│   └── videos/            # Vidéos locales (si applicable)
├── src/                   # Code source
│   ├── app/               # Routes de l'application (App Router)
│   │   ├── (admin)/       # Routes d'administration
│   │   ├── (auth)/        # Routes d'authentification
│   │   ├── (user)/        # Routes utilisateur
│   │   ├── api/           # Points d'API backend
│   │   └── page.tsx       # Page d'accueil
│   ├── components/        # Composants réutilisables
│   ├── lib/               # Utilitaires et fonctions partagées
│   ├── models/            # Modèles de données MongoDB
│   └── types/             # Types TypeScript
├── .env.example           # Exemple de variables d'environnement
├── next.config.js         # Configuration Next.js
└── package.json           # Dépendances et scripts
```

## Technologies Utilisées

- **Framework** : Next.js 14
- **Langage** : TypeScript
- **Base de données** : MongoDB avec Mongoose
- **Authentification** : NextAuth.js
- **Styles** : Tailwind CSS
- **Formulaires** : React Hook Form
- **Notification** : React Hot Toast
- **Validation** : Zod
- **UI Components** : HeadlessUI, Lucide React

## Déploiement

Le projet peut être déployé sur différentes plateformes :

- **Vercel** (recommandé pour Next.js) : 
  ```bash
  vercel
  ```
- **Netlify** : Configurer pour déployer depuis GitHub avec les variables d'environnement appropriées
- **Self-hosted** : Construire avec `npm run build` et démarrer avec `npm start`

## Développement

### Architecture du Code

Le projet suit une architecture modulaire avec séparation claire des responsabilités :
- Routes d'API pour la communication serveur
- Composants React pour l'interface utilisateur
- Modèles Mongoose pour la persistance des données
- Hooks personnalisés pour la logique réutilisable

### Gestion des Images

Les images des cours sont stockées localement dans `/public/images/courses/` :
- `course-1.jpg` à `course-5.jpg` 

Pour ajouter une nouvelle image de cours :
1. Placez l'image dans le dossier `/public/images/courses/`
2. Référencez-la dans la base de données ou utilisez le système de secours automatique

### Tests

Lancer les tests unitaires :
```bash
npm run test
```

## Licence

Ce projet est sous licence propriétaire. Tous droits réservés.

---

Développé avec ❤️ pour NWS Laser
