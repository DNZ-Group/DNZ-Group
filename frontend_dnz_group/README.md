# DNZ-Group

Application web de gestion de transport et de logistique, développée avec **Vue 3** et **Vite**.

## Description

DNZ-Group est une plateforme qui permet aux utilisateurs de :

- Consulter les services de transport proposés (**Transport Voiture**, **Transport Coli**)
- Créer un compte et se connecter
- Gérer leurs articles de transport (voitures et cartons) depuis leur espace personnel
- Renseigner les détails d'un carton : dimensions (H × L × l), poids, contenu avec suggestions
- Renseigner les détails d'une voiture : marque (avec suggestions), modèle, immatriculation

## Technologies utilisées

- [Vue 3](https://vuejs.org/) — framework JavaScript (Composition API, `<script setup>`)
- [Vite](https://vitejs.dev/) — bundler et serveur de développement
- [Vue Router](https://router.vuejs.org/) — navigation entre les pages
- **localStorage** — persistance des données utilisateurs et articles (côté client)

## Structure des pages

| Route | Description |
|-------|-------------|
| `/` | Page d'accueil — liste des articles si connecté |
| `/login` | Page de connexion |
| `/register` | Page de création de compte |
| `/services/transport-voiture` | Page Transport Voiture |
| `/services/transport-coli` | Page Transport Coli |

## Compte de test

| Champ | Valeur |
|-------|--------|
| E-mail | `test@dnzgroup.com` |
| Mot de passe | `test1234` |

## Lancer le projet

### Prérequis

- [Node.js](https://nodejs.org/) v18 ou supérieur
- npm

### Installation

```bash
npm install
```

### Démarrer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:5173](http://localhost:5173).

### Build de production

```bash
npm run build
```

### Prévisualiser le build

```bash
npm run preview
```

