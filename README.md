# DNZ-Group — Plateforme de Transport et Logistique

Application web fullstack de gestion de transport, composée d'un frontend Vue 3 et d'un backend Node.js/Express.

```
DNZ-GROUP/
├── frontend_dnz_group/   → Application Vue 3 (interface utilisateur)
└── backend_dnz_group/    → API REST Node.js/Express (serveur)
```

---

## Frontend — `frontend_dnz_group`

Interface web développée avec **Vue 3** et **Vite**.

### Fonctionnalités

- Navigation avec menu déroulant **Nos Services** (Transport Voiture, Transport Coli)
- Pages dédiées : Transport Voiture, Transport Coli
- Authentification : connexion et création de compte
- Espace utilisateur : gestion des articles (voitures et cartons)
- Formulaire de création d'article avec suggestions de marques/modèles et contenu carton

### Compte de test

| E-mail | Mot de passe |
|--------|--------------|
| `test@dnzgroup.com` | `test1234` |

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

### Configuration

Créer un fichier `.env` dans `backend_dnz_group/` :

```env
PORT=3000
JWT_SECRET=votre_secret_jwt
FRONTEND_URL=http://localhost:5173
```

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
| Stockage | Fichiers JSON (localStorage côté client) |
