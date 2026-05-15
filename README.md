# PalTech Forge — AI-assisted hackathon starter

Production-grade Next.js starter focused on **fast pivots**: secure authentication, RBAC, operational dashboards, audit primitives, and modular “business surfaces” you can replace once the real problem statement arrives.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **TailwindCSS** + **shadcn/ui-style** component primitives (Radix)
- **PostgreSQL** + **Prisma ORM**
- **Auth.js / NextAuth.js v5** with **JWT sessions**, **Credentials**, and **Google OAuth**
- **bcrypt** password hashing
- **React Hook Form** + **Zod**
- **sonner** toasts + **next-themes** dark mode

## Quick start

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Copy `.env.example` to `.env` and fill values:

- **`DATABASE_URL`**: PostgreSQL connection string
- **`AUTH_SECRET`**: long random secret (Auth.js)
- **`AUTH_URL`**: public app URL (local: `http://localhost:3000`)
- **`AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`**: optional Google OAuth
- **`JWT_SECRET`**: optional separate secret for custom API JWT helpers (`src/lib/jwt.ts`)

### 3) Create database schema

```bash
npm run db:push
```

### 4) Seed demo users + notifications

```bash
npm run db:seed
```

Default credentials (local seed):

- **Admin**: `admin@starter.local` / `Admin123!`
- **User**: `user@starter.local` / `User123!`

### 5) Run the dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Prisma notes

- Schema lives in `prisma/schema.prisma`.
- Prisma Client is generated to `node_modules/@prisma/client`.
- If `prisma generate` fails in restricted networks, set `NODE_TLS_REJECT_UNAUTHORIZED=0` **only** as a temporary local workaround, or configure your corporate root CA trust store.

## Authentication model (Auth.js + JWT)

- **Sessions**: JWT strategy (`session: { strategy: "jwt" }`) for scalable, cookie-based sessions without DB session reads on every request.
- **OAuth linking + user persistence**: `@auth/prisma-adapter` stores users/accounts/tokens in PostgreSQL while sessions remain JWT-backed.
- **Credentials**: bcrypt verification against `User.password`.
- **Google OAuth**: enabled only when `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are set.
- **Suspended users**: blocked in middleware via JWT claims refreshed on a short interval server-side.

## Google OAuth setup

1. Create OAuth credentials in Google Cloud Console.
2. Add authorized redirect URI:

`{AUTH_URL}/api/auth/callback/google`

3. Set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in `.env`.

## Middleware + route protection

`src/middleware.ts` uses `getToken` from `next-auth/jwt` (Edge-friendly) to:

- protect `/dashboard`, `/admin`, `/modules`
- redirect unauthenticated users to `/login`
- block **suspended** users
- prevent non-admins from accessing `/admin`

## RBAC

Roles are stored in Prisma (`Role` enum: `ADMIN`, `USER`).

- **Admin surfaces**: `/admin/*` (enforced in middleware + `requireAdmin()` server guard)
- **User surfaces**: `/dashboard/*` and `/modules/*`

## Folder structure (high level)

```text
src/
  app/                 # App Router routes (marketing, auth, dashboards, modules)
  actions/             # Server Actions (auth, admin, profile, CRUD stubs)
  auth/                # Auth.js configuration (handlers + callbacks)
  components/          # UI + layout + feature components
  constants/           # Shared constants (navigation, routes)
  features/            # Domain modules (mock registries, etc.)
  hooks/               # (optional) client hooks
  lib/                 # prisma client, validation, utilities, jwt helpers
  prisma/              # (placeholder) optional docs / artifacts (schema remains /prisma)
  providers/           # App-wide providers (session + theme)
  types/               # TypeScript module augmentations (next-auth)
```

## Architecture overview

- **Server Components first**: pages fetch with Prisma on the server where possible.
- **Server Actions** for mutations with server-side authorization checks.
- **Client components** where interactivity is required (forms, menus, theme toggles).
- **Separation of concerns**:
  - `lib/auth-guard.ts` centralizes session/admin checks for RSC layouts.
  - `actions/*` centralizes mutations and validation entry points.
  - `features/modules/*` provides mock datasets + registry for rapid UI iteration.

## AI-assisted development

This template is designed for **human + AI pair programming**:

- Clear boundaries (`actions/`, `features/`, `lib/`) make it easy for an AI agent to extend without breaking auth.
- Mock modules (`/modules/*`) give you a consistent CRUD-shaped UI to rewrite once the brief is known.
- Keep “business truth” in Prisma models + server actions; keep UI mostly declarative.

## Scripts

- `npm run dev` — Next dev server
- `npm run build` — `prisma generate` + `next build`
- `npm run start` — production server
- `npm run lint` — ESLint
- `npm run db:push` — push schema to DB
- `npm run db:migrate` — create migrations (dev)
- `npm run db:seed` — seed demo data
- `npm run db:studio` — Prisma Studio

## Security checklist (before demo/production)

- Rotate all secrets (`AUTH_SECRET`, `JWT_SECRET`, DB creds).
- Ensure Google OAuth redirect URLs match deployment domains.
- Review admin destructive actions (delete user) and add confirmations appropriate to your threat model.
- Add rate limiting / bot protection on auth routes if exposed publicly.

## License

Private hackathon template (adjust as needed).
