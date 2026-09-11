# Bibliothèque de quartier — Projet Akieni Academy (S14-S15)

Application de gestion d'une bibliothèque de quartier : auteurs, adhérents, livres et emprunts.

## Stack
- **Backend** : Node.js, Express, PostgreSQL (driver `pg`)
- **Frontend** : HTML / CSS / JavaScript vanilla, consommant l'API via `fetch()`

## Structure du projet
```
bibliotheque-app/
├── backend/
│   ├── schema.sql          # script SQL de création des tables
│   ├── server.js           # point d'entrée
│   ├── config/db.js        # connexion PostgreSQL
│   ├── routes/              # une route par ressource
│   ├── controllers/         # logique métier
│   └── middlewares/          # logger, validation, gestion d'erreurs
└── frontend/
    ├── index.html
    ├── css/style.css
    └── js/                   # un module par ressource + api.js pour fetch()
```

## Installation

### 1. Base de données
```bash
createdb bibliotheque
cd backend
psql -U postgres -d bibliotheque -f schema.sql
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# éditer .env avec vos identifiants PostgreSQL
npm start
```
L'API démarre sur `http://localhost:3000/api`.

### 3. Frontend
Ouvrir `frontend/index.html` dans le navigateur (ou servir le dossier avec `npx serve frontend`).

## Choix de modélisation

- **Statut d'un livre** : colonne booléenne `disponible` sur `livres`, mise à jour automatiquement à la création/au retour d'un emprunt (pas de recalcul à la volée).
- **Statut d'un emprunt** (en cours / rendu / en retard) : dérivé de deux colonnes sur `emprunts` plutôt que stocké :
  - `date_retour_effective IS NULL` → emprunt en cours
  - `date_retour_effective IS NULL AND date_retour_prevue < CURRENT_DATE` → en retard
  
  Cela évite un champ `statut` redondant qui pourrait devenir incohérent avec les dates.
- **Concurrence sur les emprunts** : la création d'un emprunt et l'enregistrement d'un retour utilisent une transaction avec `SELECT ... FOR UPDATE` pour éviter qu'un même livre soit emprunté deux fois simultanément.
- **Recherche de livres** : `ILIKE` sur `titre` et le nom de l'auteur (jointure), avec pagination via `LIMIT`/`OFFSET`.

## Endpoints principaux

| Méthode | Route | Description |
|---|---|---|
| GET/POST/PUT/DELETE | `/api/auteurs` | CRUD auteurs |
| GET/POST/PUT/DELETE | `/api/adherents` | CRUD adhérents |
| GET | `/api/adherents/:id/emprunts` | Historique d'un adhérent |
| GET/POST/PUT/DELETE | `/api/livres` | CRUD livres (recherche `?q=`, pagination `?page=&limite=`) |
| GET | `/api/emprunts` | Emprunts en cours |
| GET | `/api/emprunts/retard` | Emprunts en retard |
| POST | `/api/emprunts` | Créer un emprunt |
| PATCH | `/api/emprunts/:id/retour` | Enregistrer un retour |
| GET | `/api/stats` | Statistiques / tableau de bord |
