Titre du projet : Création du site web NWS Laser Formations (formations laser en ligne)
tu géreras ce projet sur le git suivant : https://github.com/SachaDodane/NWS-Laser-Formations-
1. Technologies & Frameworks
Utilise un framework JavaScript moderne (React, Vue, Angular ou Next.js) qui te permettra d’avoir un design professionnel, fluide et moderne.

Prévois une architecture adaptée pour accueillir jusqu’à 1000 utilisateurs.

2. Objectifs du site
One-Page Accueil (Landing Page) :

Présentation globale de NWS Laser Formations.

Présentation des formations laser (ex. Sécurité Laser Niveau 1, Technologie Laser, etc.).

Call-to-Action pour acheter ou accéder aux formations.

Design en bleu et blanc, avec des animations modernes (transitions fluides, éléments interactifs, etc.).

Insertion du logo officiel (lien : https://nws-tech.fr/wp-content/uploads/2023/06/nws_laser_tr.png).

Inscription / Connexion :

Système de création de compte (email, mot de passe) et login.

Passwords hashés en base de données.

Gestion des commandes & paiements :

Mise en place d’un mock d’API Stripe (paiement simulé) pour valider les processus de commande.

Espace utilisateurs :

Accès aux formations achetées dans une section « Suivre ma formation ».

Affichage de l’avancement (badges en cours, terminé, etc.).

Possibilité de relancer le quiz final si l’utilisateur échoue.

Contenu des formations :

Plusieurs chapitres/pages (texte, images, vidéos stockées sur le serveur).

Quiz intermédiaires au fil des modules, avec un quiz final.

Génération d’un PDF de certificat quand l’utilisateur obtient +80% de réussite au quiz final.

Espace Admin :

Compte admin : login : admin / mot de passe : admin.

Création/édition des formations (chapitres, textes, vidéos, quiz).

Un tableau de bord (dashboard) caché aux utilisateurs standard, pour :

Gérer les formations.

Générer des codes promo et codes de réduction 100% (pour factures clients).

Mentions légales & Politiques :

Pages statiques : Mentions légales, Politique de confidentialité, CGV/CGU.

Base de Données :

Table users (ou équivalent) avec champs :

id, nom, email, mot_de_passe_hash, téléphone, fonction, etc.

Table formations pour stocker toutes les formations & leurs modules.

Table achats / orders pour lier un utilisateur à ses formations achetées + état de la commande.

Table quiz_results (ou un champ dans achats) pour enregistrer les scores de quiz et le statut de certification.

UI/UX :

Couleurs principales : bleu et blanc.

Design responsive, clair et épuré.

Animations modernes (transitions, hover effects, micro-interactions).

Mises en page engageantes pour favoriser l’apprentissage en ligne.

Fonctionnalités supplémentaires (optionnelles) :

Système de notifications (mail ou in-app) pour prévenir l’utilisateur quand une formation est complétée ou lorsqu’un quiz est corrigé.

Espace commentaires ou FAQ pour chaque module.

Option de téléchargement de ressources PDF annexes.

Sécurité & Architecture :

Mots de passe obligatoirement hashés.

Vérification de la connexion (tokens/sessions) pour protéger l’accès aux formations.

Gérer les rôles (user/admin) de manière sécurisée.

Livrables & Résultats attendus :

Arborescence du projet (frontend + backend si besoin).

Pages codées, design en cohérence avec la charte (bleu/blanc + logo).

Simulateur de paiement (mock Stripe).

Dashboard admin opérationnel (gestion des formations, codes promo).

Quiz & génération de PDF de certificat en cas de réussite (>80%).

Pages légales complètes.

Points importants à respecter
One-Page Accueil : Section(s) mettant en valeur les formations (liste, titres, résumés, bouton d’achat).

Page "Suivre ma formation" :

Liste des formations achetées.

Statut (en cours/terminé).

Accès au contenu multimédia (texte, image, vidéo).

Quiz intermédiaires + quiz final avec PDF de diplôme.

Compatibilité : Le site doit être utilisable sur desktop, mobile et tablette.

Accès Admin : L’admin doit pouvoir se connecter avec admin:admin et accéder à un dashboard non visible par les utilisateurs classiques.

Conclusion & Requête
“Avec ces spécifications, génère-moi le code complet d’un site web fonctionnel, au design professionnel, en bleu et blanc, incluant animations modernes, espace membre, système d’achat de formations (mock Stripe), quiz avec PDF de diplôme, dashboard admin pour gérer formations et codes promo, et toutes les pages légales nécessaires.”