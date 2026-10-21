# Aramons Les Palatines

> Application de gestion pour résidence : planning ménage, résidents, agents d'entretien, restaurant et documents PDF.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-components-black)](https://ui.shadcn.com/)

---

## Sommaire

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Démarrage rapide](#démarrage-rapide)
- [Variables d'environnement](#variables-denvironnement)
- [Base de données](#base-de-données)
- [Scripts](#scripts)
- [Sécurité](#sécurité)
- [PWA & notifications push](#pwa--notifications-push)
- [Génération de PDF](#génération-de-pdf)
- [Conventions de code](#conventions-de-code)
- [Licence](#licence)

---

## Aperçu

**Aramons Les Palatines** est une application web complète destinée à la gestion quotidienne d'une résidence. Elle couvre trois publics :

| Public | Accès | Fonctions principales |
|---|---|---|
| **Administration** | `/admin/*` (rôle admin requis) | Tableau de bord, planning, résidents, agents, restaurant, notifications |
| **Agents d'entretien** | `/menage/[uuid]` | Consultation et mise à jour des ménages assignés |
| **Résidents / proches** | `/planning`, `/restaurant`, `/account` | Consultation du planning, du menu, espace personnel |

L'application est **installable (PWA)**, fonctionne **hors-ligne** pour la consultation, et propose des **notifications push** pour prévenir les agents et les résidents.

---

## Fonctionnalités

### Tableau de bord
- KPI du mois (ménages prévus, terminés, en attente, annulés)
- Agenda du jour et aperçu des 7 prochains jours
- Répartition de la charge par agent
- Streaming progressif via **React Suspense** + skeletons (pas de blocage de page)

### Planning ménage
- Vue mensuelle par agent (onglets)
- Navigation multi-mois par query params (`?year=YYYY&month=MM`)
- Génération automatique du planning (`/api/generate-planning`)
- Prise en compte des **absences agents**
- Export PDF du planning complet

### Résidents
- CRUD complet avec recherche et filtres (Data Table)
- Fiche résident détaillée (`/admin/residents/[uuid]`)
- Génération de documents : **avis**, **fiche contact**, **fiche information**, **rapport mensuel** (PDF)

### Agents d'entretien
- CRUD agents
- Suivi des absences
- Checklist ménage générée en PDF

### Restaurant
- Point de vente (POS) intégré : produits, panier, validation
- Menu public accessible via `/restaurant`
- Gestion des stocks et des prix

### Notifications
- Abonnement push côté client (`web-push` + service worker)
- Envoi ciblé ou en diffusion depuis l'admin (`/admin/notifications`)
- Compatible iOS, Android et desktop (via PWA installée)

### Authentification
- Supabase Auth (email/password)
- Flux complets : inscription, confirmation email, mot de passe oublié, mise à jour de mot de passe
- Protection des routes par **middleware** + vérification de rôle
- Page `/unauthorized` dédiée

---

## Stack technique

- **Framework** : Next.js (App Router, Server Components, Server Actions)
- **Langage** : TypeScript strict
- **UI** : Tailwind CSS v4 + shadcn/ui + Lucide Icons
- **Base de données & Auth** : Supabase (Postgres + Row Level Security)
- **Validation** : Zod (schémas dans `lib/schema/`)
- **PDF** : React PDF (`components/pdf/`)
- **Notifications** : Web Push + Service Worker (`public/sw.js`)
- **PWA** : Manifest Next.js (`app/manifest.ts`)

---

## Architecture

```
app/
├── (admin)/admin/         # Espace protégé administration
│   ├── dashboard/         # Tableau de bord (Server Components streamés)
│   ├── planning/          # Planning ménage
│   ├── residents/         # Gestion résidents
│   ├── agents/            # Gestion agents
│   ├── restaurant/        # Administration restaurant
│   └── notifications/     # Diffusion push
├── (main)/                # Espace public / résidents
│   ├── planning/
│   ├── contact/
│   └── account/
├── api/                   # Routes API (PDF, push, planning)
├── auth/                  # Flux d'authentification
├── menage/[uuid]/         # Espace agent d'entretien
└── restaurant/            # Menu public

components/
├── admin/                 # Composants tableau de bord
├── planning/              # UI planning
├── pdf/                   # Documents PDF (React PDF)
├── pos/                   # Point de vente restaurant
├── ui/                    # Design system shadcn/ui
└── *.tsx                  # Composants partagés (nav, header…)

lib/
├── schema/                # Schémas Zod (source de vérité des types)
├── supabase/              # Clients Supabase (serveur + admin)
├── planning/              # Logique planning (types + utils)
├── actions/               # Server Actions
└── *.ts                   # Utilitaires (auth, push, pdf, etc.)
```

**Principes clés** :

- **Server-first** : le rendu est majoritairement côté serveur (pas de `useEffect`, pas de fetch client sur le dashboard).
- **Une seule requête partagée** : les helpers de `app/(admin)/admin/_lib/queries.ts` utilisent `cache()` de React pour dédupliquer les appels Supabase entre composants.
- **Typage de bout en bout** : les schémas Zod génèrent les types consommés par les Data Tables, les formulaires et les PDF.
- **Client CRUD générique** : `lib/supabase` + wrapper typé (`SupabaseCrud`) pour éviter la duplication de requêtes.

---

## Démarrage rapide

### Prérequis

- Node.js **20+**
- npm (ou pnpm / bun)
- Un projet **Supabase** (cloud ou self-hosted)

### Installation

```bash
git clone https://github.com/<ton-user>/aramons-les-palatines.git
cd aramons-les-palatines
npm install
```

### Configuration

1. Copie le fichier d'exemple et remplis les variables :
   ```bash
   cp .env.example .env.local
   ```

2. Applique les migrations Supabase :
   ```bash
   npx supabase db push
   ```

3. Lance le serveur de développement :
   ```bash
   npm run dev
   ```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

---

## Variables d'environnement

| Variable | Obligatoire | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Clé publique (anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Clé service role (serveur uniquement) |
| `NEXT_PUBLIC_SITE_URL` | ✅ | URL publique de l'app (ex. `https://aramons.example.com`) |
| `VAPID_PUBLIC_KEY` | ✅ | Clé publique Web Push |
| `VAPID_PRIVATE_KEY` | ✅ | Clé privée Web Push |
| `VAPID_SUBJECT` | ✅ | `mailto:contact@…` pour VAPID |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` **ne doit jamais** être exposée au navigateur. Elle n'est utilisée que dans `lib/supabase/admin.ts`.

---

## Base de données

Les tables principales :

- `residents` — résidents de la résidence
- `agents` — agents d'entretien
- `agent_absences` — absences agents
- `menages` — ménages planifiés (date, heure, agent, résident, statut)
- `recents_menages` — vue agrégée (dashboard / planning)
- `restaurant_products`, `restaurant_orders` — POS restaurant
- `push_subscriptions` — abonnements Web Push

Les **Row Level Security** policies sont définies dans `supabase/`. Elles garantissent :

- qu'un agent ne voit que ses propres ménages ;
- qu'un administrateur voit tout ;
- que les résidents n'accèdent qu'à leurs données via `/account` et `/menage/[uuid]`.

---

## Scripts

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # ESLint
npm run typecheck    # Vérification TypeScript
```

<!-- Ajuste selon les scripts réels de ton package.json -->

---

## Sécurité

- **Middleware** (`lib/middleware.ts` + `proxy.ts`) : contrôle d'accès sur toutes les routes protégées.
- **Vérification de rôle** côté serveur, jamais côté client seul.
- **Redirections validées** via `lib/safe-next-path.ts` (anti open-redirect).
- **Row Level Security** activée sur toutes les tables sensibles.
- **Service Role Key** isolée dans un module serveur dédié.
- **Validation Zod** systématique des entrées (formulaires, API, actions).

---

## PWA & notifications push

L'application est **installable** (manifest + service worker dans `public/sw.js`) et fonctionne partiellement hors-ligne.

Pour activer les notifications :

1. Génère une paire de clés VAPID :
   ```bash
   npx web-push generate-vapid-keys
   ```
2. Renseigne-les dans `.env.local`.
3. Les utilisateurs s'abonnent depuis `/account` (`components/notifications/push-notifications.tsx`).
4. Les admins peuvent envoyer une notification à tous les abonnés depuis `/admin/notifications`.

> Sur iOS, les notifications push ne fonctionnent qu'après **installation de l'app** sur l'écran d'accueil (iOS 16.4+).

---

## Génération de PDF

Tous les documents sont générés **côté serveur** via React PDF, exposés par des routes dédiées dans `app/api/pdf/` :

| Route | Document |
|---|---|
| `/api/pdf` | Génération générique |
| `/api/pdf/resident-notice` | Avis résident |
| `/api/pdf/resident-report` | Rapport mensuel résident |

Composants réutilisables dans `components/pdf/` avec un thème commun (`theme.ts`) et un layout partagé (`PDFLayout.tsx`).

---

## Conventions de code

- **Composants serveur par défaut** : `"use client"` uniquement si nécessaire (interactivité, hooks, état).
- **Imports absolus** via `@/`.
- **Composants UI** : shadcn/ui, jamais de CSS custom ad hoc.
- **Typage strict** : aucun `any` (voir `lib/supabase` pour la stratégie utilisée sur les builders Supabase).
- **Nommage** : fichiers en `kebab-case`, composants en `PascalCase`, hooks en `use*`.
- **Formulaires** : Zod + Server Actions, pas de `fetch` POST côté client.

---

## Licence

<!-- Choisis : MIT, privé, etc. -->

Projet privé — © Aramons Les Palatines. Tous droits réservés.