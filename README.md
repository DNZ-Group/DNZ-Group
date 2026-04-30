# DNZ-Group — Plateforme de Transport et Logistique

Application web fullstack de gestion de transport, composée d'un frontend Vue 3 et d'un backend Node.js/Express.

```
DNZ-GROUP/
├── frontend_dnz_group/   → Application Vue 3 (interface utilisateur)
└── backend_dnz_group/    → API REST Node.js/Express (serveur)
```

---

## Panneau d'administration — Dashboard

Le dashboard est accessible uniquement aux comptes de rôle **admin** via la route `/admin`. Il regroupe tous les outils de gestion de la plateforme en un seul endroit.

### Comptes administrateurs

| Nom | E-mail | Mot de passe | Rôle |
|-----|--------|--------------|------|
| Administrateur | `admin@dnzgroup.com` | `Admin@2026` | Admin |
| Admin Test | `admin.test@dnzgroup.com` | `TestAdmin@2026` | Admin |
| Utilisateur Test | `test@dnzgroup.com` | `test1234` | Utilisateur |

### Onglets du dashboard

#### 📊 Statistiques
Vue d'ensemble en temps réel : nombre d'utilisateurs, d'articles, de voitures et de cartons enregistrés sur la plateforme. Affiche également la liste des derniers utilisateurs inscrits.

#### 👥 Utilisateurs
Liste complète de tous les comptes (utilisateurs et admins). Permet de créer un nouveau compte (utilisateur ou administrateur) et de supprimer un compte utilisateur. Les comptes admin ne peuvent pas être supprimés depuis cette interface.

#### 📦 Articles
Tableau de tous les articles enregistrés sur la plateforme, tous utilisateurs confondus. Chaque article est affiché avec le nom de son propriétaire, son type (voiture ou carton), ses détails et sa date de création. Un admin peut supprimer n'importe quel article.

#### ✉️ Messagerie
Interface email directement intégrée au dashboard, connectée au compte Yahoo de l'administrateur (`tchindefossomael@yahoo.fr`) via SMTP et IMAP.
- **Boîte de réception** : liste et lecture des emails reçus, avec possibilité de répondre en un clic.
- **Envoyés** : historique des emails envoyés depuis le dashboard.
- **Nouveau message** : formulaire d'envoi d'email vers n'importe quel destinataire.

> **Prérequis** : renseigner un App Password Yahoo dans le fichier `.env` (`MAIL_PASS=...`).

#### 📅 Calendrier
Calendrier mensuel interactif pour planifier et suivre les dates de transport de colis.
- Navigation mois par mois.
- Cliquer sur un jour pour voir les transports prévus ce jour et en ajouter de nouveaux (libellé, heure, description).
- Liste complète de tous les transports planifiés (passés et à venir) avec statut visuel.

#### ⚠️ Conflits

Registre de tous les incidents et litiges survenus durant les transports.

**Source des données :** les conflits sont détectés et alimentés à partir des **échanges entre les clients et l'administration**, que ce soit via **WhatsApp** ou via la **messagerie email** intégrée au dashboard. Une **intelligence artificielle** analyse et filtre ces conversations pour identifier automatiquement les signaux de conflit (réclamation, colis endommagé, retard, litige, etc.), et propose à l'admin d'enregistrer l'incident correspondant.

Chaque conflit enregistré contient :
- Le **nom du client** concerné
- La **date** de l'incident
- Un **titre / objet** du conflit
- Une **description** détaillée
- Un niveau de **gravité** : Faible / Moyenne / Élevée
- Un **statut** : Ouvert 🔴 ou Résolu ✅

L'admin peut marquer un conflit comme résolu une fois le litige traité. Un badge rouge dans la sidebar indique le nombre de conflits encore ouverts. Les filtres permettent d'afficher tous les conflits, uniquement les ouverts, ou uniquement les résolus.

> **Roadmap IA** : l'intégration de l'IA de filtrage des conversations (WhatsApp Business API + analyse sémantique des emails) est prévue pour alimenter automatiquement ce registre sans saisie manuelle.

#### 📈 Progression

Tableau de bord analytique avec KPIs et graphiques pour mesurer la croissance de l'activité.

**KPIs principaux :**
- Clients enregistrés (base utilisateurs totale)
- Articles transportés (voitures + colis)
- Transports planifiés (total agenda)
- Taux de résolution des conflits (%)

**Graphiques et classements :**
- **Répartition voitures / cartons** : donut chart avec pourcentages.
- **Conflits par gravité** : barres horizontales (Faible / Moyenne / Élevée).
- **Transports par mois** : histogramme des 12 derniers mois (mois courant mis en valeur).
- **Villes des clients (top 8)** : classement des villes les plus représentées dans la base client, avec barre proportionnelle et pourcentage de la base totale.
- **Marques de voitures les plus transportées (top 6)** : classement des marques automobiles par fréquence de transport.
- **Contenu des cartons le plus transporté (top 6)** : classement des articles les plus déclarés dans les cartons (vêtements, électronique, etc.).

**Méthodes de croissance :** 6 indicateurs qualitatifs (acquisition client, volume d'activité, planification, qualité de service, communication client, analyse des données).

#### 🚢 Suivi conteneur

Suivi complet du cycle de vie des conteneurs maritimes, de la collecte des colis jusqu'à la livraison finale.

L'onglet est divisé en deux vues :

**🚢 En cours** — liste des conteneurs actifs avec leur timeline en 3 étapes :
1. **Chargement** : dates de début/fin, liste des dépôts clients (nom, date, heure, nombre de colis).
2. **Voyage** : nom du bateau, date de départ, date d'arrivée.
3. **Déchargement** : date d'ouverture, liste des retraits clients (nom, date, statut retiré/non retiré), indicateur de clôture.

Chaque étape peut être mise à jour indépendamment. Le statut du conteneur avance automatiquement : En préparation → Chargement → En mer → Déchargement → Terminé.

**📚 Historique** — archive des conteneurs terminés, consultable à tout moment. Chaque fiche d'historique affiche un résumé compact des 3 étapes (dates, durées calculées, nombre de dépôts/retraits) sans possibilité de modification.

---

## Frontend — `frontend_dnz_group`

Interface web développée avec **Vue 3** et **Vite**.

### Fonctionnalités

- Navigation avec menu déroulant **Nos Services** (Transport Voiture, Transport Coli)
- Pages dédiées : Transport Voiture, Transport Coli
- Authentification : connexion et création de compte
- Espace utilisateur : gestion des articles (voitures et cartons)
- Formulaire de création d'article avec suggestions de marques/modèles et contenu carton

### Lancer le frontend

```bash
cd frontend_dnz_group
npm install
npm run dev
```

L'application sera accessible sur [http://localhost:5173](http://localhost:5173)

### Build de production

```bash
npm run build
```

---

## Backend — `backend_dnz_group`

API REST développée avec **Node.js** et **Express**. Les données sont stockées dans des fichiers JSON locaux.

### Fonctionnalités

- Inscription et connexion avec mot de passe hashé (bcryptjs)
- Authentification par token JWT (valable 7 jours)
- CRUD complet des articles par utilisateur connecté
- Protection de toutes les routes articles par middleware JWT
- Routes admin protégées par middleware de rôle (`role: 'admin'`)
- Envoi et lecture d'emails via SMTP/IMAP Yahoo (nodemailer + imapflow)
- Création automatique du compte admin au démarrage du serveur

### Routes API

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/health` | Non | Vérification du serveur |
| POST | `/api/auth/register` | Non | Créer un compte |
| POST | `/api/auth/login` | Non | Se connecter |
| GET | `/api/articles` | JWT | Lister ses articles |
| POST | `/api/articles` | JWT | Créer un article |
| PUT | `/api/articles/:id` | JWT | Modifier un article |
| DELETE | `/api/articles/:id` | JWT | Supprimer un article |
| GET | `/api/admin/stats` | Admin | Statistiques globales |
| GET | `/api/admin/users` | Admin | Liste des utilisateurs |
| POST | `/api/admin/users` | Admin | Créer un utilisateur/admin |
| DELETE | `/api/admin/users/:id` | Admin | Supprimer un utilisateur |
| GET | `/api/admin/articles` | Admin | Tous les articles |
| DELETE | `/api/admin/articles/:id` | Admin | Supprimer un article |
| POST | `/api/admin/email/send` | Admin | Envoyer un email |
| GET | `/api/admin/email/inbox` | Admin | Lire la boîte de réception |
| GET | `/api/admin/email/sent` | Admin | Lire les emails envoyés |

### Configuration

Fichier `.env` dans `backend_dnz_group/` :

```env
PORT=3000
JWT_SECRET=votre_secret_jwt
FRONTEND_URL=http://localhost:5173

# Yahoo Mail (App Password requis)
MAIL_USER=tchindefossomael@yahoo.fr
MAIL_PASS=votre_app_password_yahoo
```

> Générer un App Password Yahoo : https://login.yahoo.com/myaccount/security/app-passwords

### Lancer le backend

```bash
cd backend_dnz_group
npm install
npm run dev     # avec hot-reload (Node.js --watch)
# ou
npm start       # sans hot-reload
```

L'API sera accessible sur [http://localhost:3000](http://localhost:3000)

---

## Lancer les deux en même temps

Ouvrir deux terminaux :

**Terminal 1 — Backend :**
```bash
cd backend_dnz_group && npm run dev
```

**Terminal 2 — Frontend :**
```bash
cd frontend_dnz_group && npm run dev
```

---

## Technologies

| Côté | Technologie |
|------|-------------|
| Frontend | Vue 3, Vite, Vue Router |
| Backend | Node.js, Express, JWT, bcryptjs |
| Email | Nodemailer (SMTP), ImapFlow (IMAP), Yahoo Mail |
| Stockage | Fichiers JSON (backend) + localStorage (frontend) |
| Sécurité | JWT, bcrypt, middleware de rôle admin |
| IA (roadmap) | Filtrage automatique des conflits via conversations WhatsApp/email |
