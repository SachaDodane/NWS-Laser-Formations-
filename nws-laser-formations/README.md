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

## Déploiement sur VPS

Ce guide explique comment déployer l'application NWS Laser Formations sur un serveur VPS, y compris la configuration de la base de données MongoDB, du serveur web et des certificats SSL.

### 1. Préparer le VPS

#### Configuration initiale du serveur
```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Node.js et npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier l'installation
node -v  # Doit afficher v18.x.x
npm -v   # Vérifier la version de npm

# Installer PM2 pour gérer les processus Node
sudo npm install -g pm2
```

#### Installer Nginx comme serveur reverse proxy
```bash
# Installation de Nginx
sudo apt install -y nginx

# Activer et démarrer Nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 2. Installer et configurer MongoDB

#### Option 1 : MongoDB sur le même VPS
```bash
# Installer MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Activer et démarrer MongoDB
sudo systemctl enable mongod
sudo systemctl start mongod

# Vérifier le statut
sudo systemctl status mongod
```

#### Option 2 : Utiliser MongoDB Atlas (recommandé pour la production)
1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Configurez un cluster (l'option gratuite est suffisante pour commencer)
3. Créez un utilisateur de base de données avec les droits appropriés
4. Ajoutez l'adresse IP de votre VPS à la liste blanche
5. Obtenez votre chaîne de connexion (format: `mongodb+srv://username:password@cluster0.mongodb.net/nws-laser`)

### 3. Déployer l'application Next.js

#### Préparer l'application
```bash
# Créer un répertoire pour l'application
sudo mkdir -p /var/www/nws-laser
sudo chown -R $USER:$USER /var/www/nws-laser

# Cloner le dépôt GitHub
cd /var/www/nws-laser
git clone https://github.com/SachaDodane/NWS-Laser-Formations- .

# Installer les dépendances
npm install
```

#### Configurer les variables d'environnement
```bash
# Créer le fichier .env.local
nano .env.local
```

Exemple de contenu pour `.env.local` :
```
# Base de données
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/nws-laser?retryWrites=true&w=majority
# ou pour MongoDB local
# MONGODB_URI=mongodb://localhost:27017/nws-laser

# NextAuth
NEXTAUTH_URL=https://votre-domaine.com
NEXTAUTH_SECRET=votre_secret_nextauth

# URL publique
NEXT_PUBLIC_BASE_URL=https://votre-domaine.com

# Variables pour les différents providers d'authentification
GITHUB_ID=votre_github_client_id
GITHUB_SECRET=votre_github_client_secret
GOOGLE_ID=votre_google_client_id
GOOGLE_SECRET=votre_google_client_secret
```

#### Construire et démarrer l'application
```bash
# Construire l'application
npm run build

# Démarrer avec PM2
pm2 start npm --name "nws-laser" -- start

# Configurer PM2 pour démarrer automatiquement
pm2 save
pm2 startup
```

### 4. Configurer Nginx comme reverse proxy

#### Créer la configuration Nginx
```bash
sudo nano /etc/nginx/sites-available/nws-laser
```

Contenu du fichier :
```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Augmenter la taille maximale des requêtes (pour l'upload de fichiers)
    client_max_body_size 20M;
}
```

#### Activer la configuration et redémarrer Nginx
```bash
# Créer un lien symbolique
sudo ln -s /etc/nginx/sites-available/nws-laser /etc/nginx/sites-enabled/

# Vérifier la configuration de Nginx
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

### 5. Configurer HTTPS avec Let's Encrypt

```bash
# Installer Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenir et configurer automatiquement les certificats SSL
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Le renouvellement se fera automatiquement
```

### 6. Sauvegarder la base de données

#### Créer un script de sauvegarde
```bash
sudo nano /opt/backup-mongodb.sh
```

Contenu du script :
```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/var/backups/mongodb"

mkdir -p $BACKUP_DIR
mongodump --out=$BACKUP_DIR/$DATE

# Supprimer les sauvegardes de plus de 7 jours
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
```

#### Planifier les sauvegardes automatiques
```bash
# Rendre le script exécutable
sudo chmod +x /opt/backup-mongodb.sh

# Ajouter au crontab pour exécution quotidienne à 2h du matin
(crontab -l ; echo "0 2 * * * /opt/backup-mongodb.sh") | crontab -
```

### 7. Configurer des mises à jour automatiques

```bash
# Installer les mises à jour de sécurité automatiques
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 8. Configurer le pare-feu

```bash
# Installer UFW (Uncomplicated Firewall)
sudo apt install -y ufw

# Configurer les règles
sudo ufw allow ssh        # Port 22
sudo ufw allow http       # Port 80
sudo ufw allow https      # Port 443

# Activer le pare-feu
sudo ufw enable

# Vérifier le statut
sudo ufw status
```

### 9. Commandes utiles pour la maintenance

#### Mettre à jour l'application
```bash
# Se rendre dans le dossier de l'application
cd /var/www/nws-laser

# Récupérer les dernières modifications
git pull

# Installer les dépendances
npm install

# Reconstruire l'application
npm run build

# Redémarrer l'application
pm2 restart nws-laser
```

#### Gérer l'application avec PM2
```bash
# Voir le statut des applications
pm2 list

# Voir les logs en temps réel
pm2 logs nws-laser

# Redémarrer l'application
pm2 restart nws-laser

# Arrêter l'application
pm2 stop nws-laser

# Démarrer l'application
pm2 start nws-laser
```

#### Déboguer les problèmes courants
```bash
# Vérifier les logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Vérifier les logs de l'application
pm2 logs nws-laser

# Vérifier le statut de MongoDB
sudo systemctl status mongod

# Vérifier la connexion à MongoDB
mongo --eval "db.runCommand({ connectionStatus: 1 })"
```

### 10. Optimisations de performance (optionnel)

#### Configurer la mise en cache avec Nginx
```bash
# Exemple de configuration à ajouter dans le bloc server de votre fichier Nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 30d;
    add_header Cache-Control "public, no-transform";
}
```

#### Configurer la compression gzip
```bash
# Ajouter à votre configuration Nginx
gzip on;
gzip_comp_level 5;
gzip_min_length 256;
gzip_proxied any;
gzip_vary on;
gzip_types
  application/javascript
  application/json
  application/x-javascript
  application/xml
  text/css
  text/javascript
  text/plain
  text/xml;
```

En suivant ce guide, vous aurez un déploiement complet et sécurisé de l'application NWS Laser Formations sur un VPS, avec une base de données MongoDB, un reverse proxy Nginx, et HTTPS activé.
