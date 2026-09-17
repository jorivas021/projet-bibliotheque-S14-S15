# Bibliothèque de quartier — Projet Akieni Academy (S14-S15)

Application de gestion d'une bibliothèque de quartier : auteurs, adhérents, livres, emprunts et réservations.

**Démo en ligne :**
- Frontend : `https://street-lib.onrender.com`
- API : `https://bibliotheque-api-cjsi.onrender.com/api`

## Stack
- **Backend** : Node.js, Express, PostgreSQL (driver `pg`)
- **Frontend** : HTML / CSS / JavaScript vanilla, consommant l'API via `fetch()`
- **Déploiement** : Render (Web Service pour l'API, PostgreSQL managé, Static Site pour le frontend)

## Structure du projet
```
bibliotheque-app/
├── diagramme-er.svg         # schéma entité-relation
├── backend/
│   ├── schema.sql           # script SQL de création des tables
│   ├── server.js            # point d'entrée
│   ├── config/db.js         # connexion PostgreSQL (SSL activable via DB_SSL)
│   ├── routes/               # une route par ressource
│   ├── controllers/          # logique métier
│   └── middlewares/           # logger, validation, gestion d'erreurs
└── frontend/
    ├── index.html
    ├── css/style.css
    └── js/                    # un module par ressource + api.js, toast.js
```

## Installation en local

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
copy .env.example .env      # (cp sur Mac/Linux)
# éditer .env avec vos identifiants PostgreSQL
npm start
```
L'API démarre sur `http://localhost:3000/api`.

### 3. Frontend
Ouvrir `frontend/index.html` dans le navigateur. Par défaut il pointe vers `http://localhost:3000/api` — changer `API_BASE` dans `frontend/js/api.js` pour pointer vers une API déployée.

## Choix de modélisation

- **Statut d'un livre** : colonne booléenne `disponible` sur `livres`, mise à jour automatiquement à la création/au retour d'un emprunt (pas de recalcul à la volée).
- **Statut d'un emprunt** (en cours / rendu / en retard) : dérivé de deux colonnes sur `emprunts` plutôt que stocké :
  - `date_retour_effective IS NULL` → emprunt en cours
  - `date_retour_effective IS NULL AND date_retour_prevue < CURRENT_DATE` → en retard

  Cela évite un champ `statut` redondant qui pourrait devenir incohérent avec les dates.
- **Concurrence sur les emprunts** : la création d'un emprunt et l'enregistrement d'un retour utilisent une transaction avec `SELECT ... FOR UPDATE` pour éviter qu'un même livre soit emprunté deux fois simultanément.
- **Recherche de livres** : `ILIKE` sur `titre` et le nom de l'auteur (jointure), combinable avec des filtres disponibilité/auteur, avec pagination via `LIMIT`/`OFFSET`.
- **Réservations (file d'attente)** : table `reservations` séparée (livre_id, adherent_id, date_reservation) plutôt qu'un champ sur `livres` — un livre peut être réservé par plusieurs adhérents, l'ordre de la file est donné par `date_reservation`. Une réservation n'est acceptée que si le livre est déjà emprunté, et est automatiquement retirée de la file quand l'adhérent finit par l'emprunter.

## Endpoints principaux

| Méthode | Route | Description |
|---|---|---|
| GET/POST/PUT/DELETE | `/api/auteurs` | CRUD auteurs |
| GET/POST/PUT/DELETE | `/api/adherents` | CRUD adhérents |
| GET | `/api/adherents/:id/emprunts` | Historique d'un adhérent |
| GET/POST/PUT/DELETE | `/api/livres` | CRUD livres (recherche `?q=`, filtres `?disponible=&auteur_id=`, pagination `?page=&limite=`) |
| GET | `/api/emprunts` | Emprunts en cours |
| GET | `/api/emprunts/retard` | Emprunts en retard |
| POST | `/api/emprunts` | Créer un emprunt |
| PATCH | `/api/emprunts/:id/retour` | Enregistrer un retour |
| GET | `/api/reservations?livre_id=` | File d'attente (globale ou pour un livre) |
| POST | `/api/reservations` | Réserver un livre déjà emprunté |
| DELETE | `/api/reservations/:id` | Annuler une réservation |
| GET | `/api/stats` | Statistiques / tableau de bord |

## Fonctionnalités bonus implémentées

- **Réservation d'un livre déjà emprunté (file d'attente)** — voir ci-dessus.
- **Export CSV des emprunts en retard** — bouton dans la section Emprunts, génère le fichier côté navigateur.
- **Notifications visuelles (toast)** — confirmation ou erreur après chaque action (ajout, modification, suppression, retour, réservation).
- **Filtrage des livres** par disponibilité et par auteur, combinable avec la recherche texte.

## Difficultés rencontrées & solutions

| Problème | Cause | Solution |
|---|---|---|
| `'psql' n'est pas reconnu` dans cmd | Le dossier `bin` de PostgreSQL n'était pas dans le `PATH` Windows après l'installation | Ajout manuel de `C:\Program Files\PostgreSQL\18\bin` aux variables d'environnement système |
| `Error: SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string` | Le fichier `.env` n'existait pas encore (seul `.env.example`/`.env.exemple` était présent), donc `DB_PASSWORD` valait `undefined` | Copie explicite de `.env.example` vers `.env` avec les vraies valeurs, puis redémarrage du serveur (`dotenv` ne recharge qu'au démarrage) |
| Même erreur SASL après une mise à jour du projet | `db.js` lisait `PGHOST`/`PGUSER`/`PGPASSWORD`... alors que `.env` utilisait `DB_HOST`/`DB_USER`/`DB_PASSWORD` | Uniformisation de `config/db.js` pour lire les variables `DB_*`, cohérentes avec `.env.example` et le README |
| `node_modules` et `.env` apparaissaient quand même dans `git status` malgré un `.gitignore` correct | Ces fichiers avaient déjà été ajoutés à l'index Git (`git add .`) avant la création du `.gitignore` — une règle d'exclusion n'agit pas rétroactivement sur des fichiers déjà suivis | `git reset` pour désindexer, vérification de la règle avec `git check-ignore -v`, puis nouvel `git add .` |
| `Cannot find module 'dotenv'` après avoir remplacé le dossier `backend/` par une nouvelle version | Le remplacement du dossier a supprimé `node_modules` (jamais versionné, comme prévu) | `npm install` pour réinstaller les dépendances |
| Sur Render : `password authentication failed for user "postgres"` | Render ne nomme jamais son utilisateur PostgreSQL "postgres" — il génère un nom aléatoire propre à chaque base | Récupération du vrai `Username` depuis le dashboard Render et mise à jour de la variable d'environnement `DB_USER` du service web |
| Sur Render : `database "bibliotheque" does not exist` | Le nom réel de la base généré par Render différait du nom demandé à la création | Récupération du vrai nom dans le champ `Database` du dashboard et mise à jour de `DB_NAME` |
| Connexion PostgreSQL refusée uniquement en production (Render) | Render exige une connexion SSL pour PostgreSQL, non nécessaire en local | Ajout d'une option `ssl` conditionnelle dans `config/db.js`, activée via la variable d'environnement `DB_SSL=true` |

## Déploiement (Render)

1. **PostgreSQL** : base managée créée sur Render, schéma chargé via `psql "URL_EXTERNE" -f schema.sql`.
2. **Backend** : Web Service Render, *Root Directory* = `backend`, `npm install` / `npm start`, variables d'environnement `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (valeurs exactes du dashboard PostgreSQL Render) et `DB_SSL=true`.
3. **Frontend** : Static Site Render, *Root Directory* = `frontend`, pas de build command, *Publish Directory* = `.`.