# GestSoutenance — Frontend

> Système de Gestion des Soutenances Universitaires  
> Université Numérique Cheikh Hamidou Kane (UNCHK) — Projet Licence 3, Groupe S6

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Vercel-Live-000000?logo=vercel)](https://gestion-soutenance-l3-unchk-fronten.vercel.app)

---

## Table des matières

1. [Présentation](#1-présentation)
2. [Architecture et structure](#2-architecture-et-structure)
3. [Stack technique](#3-stack-technique)
4. [Authentification et gestion de session](#4-authentification-et-gestion-de-session)
5. [Espaces par rôle](#5-espaces-par-rôle)
6. [Composants et pages](#6-composants-et-pages)
7. [Communication avec l'API](#7-communication-avec-lapi)
8. [Déploiement (Vercel)](#8-déploiement-vercel)
9. [Installation locale](#9-installation-locale)
10. [Variables d'environnement](#10-variables-denvironnement)
11. [Comptes de test](#11-comptes-de-test)

---

## 1. Présentation

Ce dépôt contient l'interface utilisateur (SPA — Single Page Application) de la plateforme GestSoutenance. Elle consomme l'API REST Laravel via des requêtes HTTP authentifiées par token Bearer (Sanctum) et présente des espaces de travail distincts et adaptés à chacun des cinq rôles du système.

### Objectifs de l'interface

- Offrir une navigation fluide sans rechargement de page (SPA)
- Adapter l'espace de travail et les menus au rôle de l'utilisateur connecté
- Protéger les routes côté client en complément de la protection côté serveur
- Fournir un retour visuel immédiat sur les actions (états de chargement, messages d'erreur/succès)

---

## 2. Architecture et structure

```
client/
├── public/                  # Assets statiques
├── src/
│   ├── api/                 # Couche d'accès à l'API
│   │   ├── client.js        # Instance Axios configurée (baseURL, intercepteurs)
│   │   ├── auth.js          # login, logout, me
│   │   ├── soutenances.js   # CRUD soutenances
│   │   ├── salles.js        # CRUD salles
│   │   ├── users.js         # CRUD utilisateurs
│   │   ├── jury.js          # Gestion des jurys
│   │   ├── documents.js     # Téléchargement de documents
│   │   ├── notifications.js # Notifications in-app
│   │   ├── indisponibilites.js
│   │   ├── responsable.js   # Validation PV, export
│   │   ├── enseignant.js    # Vues enseignant
│   │   └── audit.js         # Journal d'audit
│   │
│   ├── contexts/
│   │   ├── AuthContext.jsx  # État global d'authentification
│   │   └── ToastContext.jsx # Notifications visuelles (toasts)
│   │
│   ├── components/
│   │   ├── Layout.jsx           # Sidebar + header (Admin, Secrétaire, Enseignant)
│   │   ├── LayoutEtudiant.jsx   # Layout top-bar dédié étudiant
│   │   ├── LayoutResponsable.jsx# Layout top-bar dédié responsable
│   │   ├── ProtectedRoute.jsx   # Garde de routes (auth + rôle)
│   │   ├── LoadingSpinner.jsx
│   │   ├── TableSkeleton.jsx
│   │   └── ConfirmDialog.jsx
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   └── Login.jsx              # Page de connexion
│   │   ├── admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Users.jsx
│   │   │   ├── Salles.jsx
│   │   │   ├── Audit.jsx
│   │   │   └── PlanifierSoutenance.jsx
│   │   ├── secretaire/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Soutenances.jsx
│   │   │   └── SoutenanceDetail.jsx
│   │   ├── enseignant/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MesSoutenances.jsx
│   │   │   ├── MesJurys.jsx
│   │   │   └── Indisponibilites.jsx
│   │   ├── responsable/
│   │   │   ├── Dashboard.jsx
│   │   │   └── ValidationPv.jsx
│   │   ├── etudiant/
│   │   │   └── Dashboard.jsx
│   │   └── shared/
│   │       └── Notifications.jsx
│   │
│   ├── hooks/
│   │   └── useDebounce.js
│   ├── App.jsx              # Routeur principal
│   └── main.jsx             # Point d'entrée React
│
├── vercel.json              # Config Vercel (rewrites SPA)
├── vite.config.js           # Config Vite + proxy de développement
├── tailwind.config.js
└── package.json
```

---

## 3. Stack technique

| Composant | Technologie | Version |
|---|---|---|
| Framework UI | React | 18.3 |
| Outil de build | Vite | 6.0 |
| Styling | Tailwind CSS | 3.4 |
| Post-processing CSS | PostCSS + Autoprefixer | 8.4 / 10.4 |
| Routage côté client | React Router DOM | 6.28 |
| Requêtes HTTP | Axios | 1.7 |
| Cache et synchronisation serveur | TanStack Query (React Query) | 5.59 |
| Gestion des formulaires | React Hook Form | 7.53 |
| Hébergement | Vercel | — |

### Choix techniques justifiés

**TanStack Query v5** : gère automatiquement le cache des données serveur, la revalidation et les états de chargement/erreur. Évite la duplication d'état entre le serveur et le client.

**React Router DOM v6** : routage déclaratif avec `<Outlet>` permettant d'imbriquer les gardes d'authentification (`ProtectedRoute`) dans l'arbre de routes sans duplication.

**Tailwind CSS** : approche utilitaire permettant une cohérence visuelle stricte sans fichiers CSS additionnels, et une personnalisation fine via `tailwind.config.js`.

---

## 4. Authentification et gestion de session

### Flux de connexion

```
Utilisateur saisit email + mot de passe
        │
        ▼
AuthContext.login()
        │
        ▼
POST /api/login (Axios)
        │
        ├── Succès → token stocké (localStorage si "se souvenir"
        │            sinon sessionStorage) + user en état React
        │            → redirection vers /role_dashboard
        │
        └── Échec → message d'erreur affiché sur le formulaire
```

### AuthContext (`src/contexts/AuthContext.jsx`)

Fournit via React Context l'état global `user`, `loading`, et les méthodes `login()` / `logout()`. À l'initialisation, il tente de récupérer le token stocké et d'appeler `GET /api/me` pour restaurer la session.

### Intercepteur Axios (`src/api/client.js`)

```javascript
// Injection automatique du token Bearer
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Déconnexion automatique sur 401
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### Protection des routes (`ProtectedRoute`)

```jsx
// Usage dans App.jsx
<Route element={<ProtectedRoute roles={['administrateur']} />}>
  <Route path="/admin" element={<AdminDashboard />} />
</Route>
```

`ProtectedRoute` vérifie que l'utilisateur est connecté **et** qu'il possède l'un des rôles autorisés. En cas d'échec, il redirige vers `/login` ou `/non-autorise` selon le cas.

---

## 5. Espaces par rôle

L'application adapte entièrement son interface au rôle de l'utilisateur connecté.

### Administrateur (`/admin`)

| Page | Fonctionnalité |
|---|---|
| Dashboard | Vue d'ensemble : statistiques, activité récente |
| Gestion des utilisateurs | CRUD complet — création, modification, désactivation |
| Gestion des salles | CRUD des salles avec capacité et équipements |
| Planification | Interface de planification des soutenances |
| Journal d'audit | Historique horodaté de toutes les actions |

### Secrétaire pédagogique (`/secretaire`)

| Page | Fonctionnalité |
|---|---|
| Dashboard | Vue d'ensemble des soutenances par statut |
| Liste des soutenances | Filtrage, recherche, changement de statut |
| Détail d'une soutenance | Composition du jury, saisie du PV, génération PDF |

### Enseignant (`/enseignant`)

| Page | Fonctionnalité |
|---|---|
| Dashboard | Résumé des activités en cours |
| Mes soutenances | Soutenances où l'enseignant est directeur ou membre du jury |
| Mes jurys | Invitations en attente — confirmer ou refuser |
| Indisponibilités | Déclarer, modifier, supprimer des créneaux bloquants |

### Responsable pédagogique (`/responsable`)

| Page | Fonctionnalité |
|---|---|
| Dashboard | Vue d'ensemble des PV en attente de validation |
| Validation PV | Consulter, valider ou rejeter les PV soumis par le secrétariat |

### Étudiant (`/etudiant`)

| Page | Fonctionnalité |
|---|---|
| Dashboard | Détail de sa soutenance, statut, membres du jury |

### Commun (tous les rôles)

| Page | Fonctionnalité |
|---|---|
| Notifications (`/notifications`) | Liste des notifications, marquage comme lue |

---

## 6. Composants et pages

### Routage (`App.jsx`)

Le routeur principal orchestre les routes par rôle avec des `ProtectedRoute` imbriquées :

```jsx
// Redirection intelligente selon le rôle
const DASHBOARDS = {
  administrateur:          '/admin',
  secretaire_pedagogique:  '/secretaire',
  enseignant:              '/enseignant',
  responsable_pedagogique: '/responsable',
  etudiant:                '/etudiant',
}
```

### Layouts

Trois layouts distincts sont utilisés selon le rôle :

| Layout | Utilisé pour | Caractéristiques |
|---|---|---|
| `Layout` | Admin, Secrétaire, Enseignant | Sidebar de navigation latérale + header |
| `LayoutEtudiant` | Étudiant | Barre de navigation horizontale simplifiée |
| `LayoutResponsable` | Responsable | Barre de navigation horizontale |

### Page de connexion (`Login.jsx`)

- Formulaire validé avec React Hook Form
- Boutons de démo affichant les comptes de test disponibles (clic → pré-remplissage)
- Option "Se souvenir de moi" (localStorage vs sessionStorage)
- Gestion des erreurs serveur inline

---

## 7. Communication avec l'API

### Configuration Axios (`src/api/client.js`)

```javascript
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
```

La variable `VITE_API_URL` doit pointer vers `https://gest-soutenance-api.onrender.com/api` (avec le suffixe `/api`).

### Couche API (`src/api/*.js`)

Chaque fichier expose des fonctions nommées qui wrappent les appels Axios :

```javascript
// src/api/auth.js
export const login   = (credentials) => client.post('/login', credentials).then(r => r.data)
export const logout  = ()             => client.post('/logout').then(r => r.data)
export const getMe   = ()             => client.get('/me').then(r => r.data)

// src/api/soutenances.js
export const getSoutenances = () => client.get('/secretaire/soutenances').then(r => r.data)
// ...
```

### Utilisation avec TanStack Query

```javascript
// Exemple d'utilisation dans un composant
const { data, isLoading, error } = useQuery({
  queryKey: ['soutenances'],
  queryFn: getSoutenances,
})

const mutation = useMutation({
  mutationFn: confirmSoutenance,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['soutenances'] }),
})
```

### Proxy de développement (`vite.config.js`)

En développement local, les requêtes vers `/api` sont proxiées vers le serveur Laravel local :

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    }
  }
}
```

---

## 8. Déploiement (Vercel)

### Configuration SPA (`vercel.json`)

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Cette règle de réécriture permet au routeur React (côté client) de gérer toutes les URLs. Sans elle, un accès direct à `/admin/users` retournerait une erreur 404 de Vercel.

### Flux de déploiement

```
git push origin main (repo frontend)
       │
       ▼  (webhook GitHub → Vercel)
Vercel Build
  ├── npm install (NODE_ENV=production)
  │     └── Toutes les dépendances sont en "dependencies"
  │         (pas de devDependencies) car Vercel n'installe
  │         pas les devDependencies en production
  ├── npm run build (vite build)
  │     └── VITE_API_URL injectée depuis les env vars Vercel
  └── Déploiement du dossier dist/
```

> **Important** : Vite et Tailwind CSS sont listés dans `dependencies` (non `devDependencies`) car Vercel exécute `npm install --production` par défaut. Placer les outils de build en `devDependencies` provoquerait une erreur de build.

### Variables d'environnement Vercel

| Variable | Valeur |
|---|---|
| `VITE_API_URL` | `https://gest-soutenance-api.onrender.com/api` |

Configurable dans : **Vercel Dashboard → Project → Settings → Environment Variables**

---

## 9. Installation locale

### Prérequis

- Node.js ≥ 18
- npm ≥ 9
- Le backend Laravel doit être accessible (localement ou en ligne)

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/IbrahimaISIDev/Gestion-Soutenance-L3-UNCHK-Frontend.git
cd Gestion-Soutenance-L3-UNCHK-Frontend

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local : renseigner VITE_API_URL

# 4. Lancer le serveur de développement
npm run dev
# → Application disponible sur http://localhost:5173
```

### Build de production

```bash
npm run build
# Le dossier dist/ contient les fichiers statiques prêts à déployer

npm run preview
# Prévisualise le build de production en local
```

---

## 10. Variables d'environnement

```dotenv
# URL complète de l'API backend, avec le préfixe /api
VITE_API_URL=https://gest-soutenance-api.onrender.com/api

# En développement local (si le backend tourne sur le port 8000) :
# VITE_API_URL=http://localhost:8000/api
```

> Les variables préfixées `VITE_` sont les seules exposées au code client par Vite (sécurité : les autres variables d'environnement restent serveur).

---

## 11. Comptes de test

Ces comptes correspondent aux données insérées par les seeders du backend.  
Mot de passe universel : **`password`**

| Rôle | Email |
|---|---|
| Administrateur | `admin@gestsoutenance.test` |
| Secrétaire pédagogique | `secretaire@gestsoutenance.test` |
| Responsable pédagogique | `responsable@gestsoutenance.test` |
| Enseignant | `ibrahima-fall@gestsoutenance.test` |
| Enseignant | `awa-camara@gestsoutenance.test` |
| Enseignant | `cheikh-diallo@gestsoutenance.test` |
| Enseignant | `mariama-ba@gestsoutenance.test` |
| Enseignant | `ousmane-gueye@gestsoutenance.test` |
| Étudiant | `mamadou-diao@etudiant.gestsoutenance.test` |
| Étudiant | `khady-sow@etudiant.gestsoutenance.test` |
| Étudiant | `babacar-toure@etudiant.gestsoutenance.test` |
| Étudiant | `aissatou-barry@etudiant.gestsoutenance.test` |
| Étudiant | `modou-lo@etudiant.gestsoutenance.test` |
| Étudiant | `bineta-diatta@etudiant.gestsoutenance.test` |

Ces comptes sont accessibles directement depuis les boutons de démonstration sur la page de connexion.

---

## Équipe

Projet réalisé dans le cadre de la **Licence 3 — Informatique**  
**Université Numérique Cheikh Hamidou Kane (UNCHK)** — Groupe S6

*Application en production : [https://gestion-soutenance-l3-unchk-fronten.vercel.app](https://gestion-soutenance-l3-unchk-fronten.vercel.app)*  
*API backend : [https://gest-soutenance-api.onrender.com](https://gest-soutenance-api.onrender.com)*
