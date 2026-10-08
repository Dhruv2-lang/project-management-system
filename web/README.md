# Project Management System — Web

React + TypeScript + Vite + Tailwind CSS frontend for the Project Management System.
It consumes the existing REST API in [`../backend`](../backend/README.md) (see [`../docs/API.md`](../docs/API.md)).

## Requirements

- Node.js 18+ and npm
- The backend running (default `http://localhost:5000/api`)

## Setup

```bash
cd web
npm install
cp .env.example .env     # sets VITE_API_URL
npm run dev              # http://localhost:5173
```

## Environment variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the API, including `/api`. Local: `http://localhost:5000/api`. Set to your production API URL when deploying. |

`.env` is git-ignored. Only `.env.example` is committed. Vite bakes `VITE_*` values into the bundle at build time, so never put secrets in them.

The backend only accepts browser requests from origins listed in its `CLIENT_URL` (in development any `localhost` port is allowed). When deploying the web app, add its URL to the backend's `CLIENT_URL`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload on port 5173 |
| `npm run build` | Type-check (`tsc -b`) and produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Type-check only |

## Pages

| Route | Access | Description |
|---|---|---|
| `/login` | signed out | Email + password sign in |
| `/register` | signed out | Full name, email, password |
| `/dashboard` | signed in | Metric cards (projects, tasks, completed, pending, in progress) |
| `/projects` | signed in | Project cards; create, edit, delete; search by name; filter by status |
| `/tasks` | signed in | Task list; create, edit, delete; mark complete; inline status/priority; search; filter by status, priority, project |

Unauthenticated visits to protected routes redirect to `/login` and return to the requested page after sign in.

## Structure

```
src/
├── components/   shared UI (Button, Modal, ConfirmDialog, form controls, badges, route guards, form modals)
├── context/      AuthContext (session + token), ToastContext
├── hooks/        useDebounce
├── layouts/      AppLayout (sidebar), AuthLayout
├── pages/        Login, Register, Dashboard, Projects, Tasks, NotFound
├── services/     api.ts (Axios client) + auth / project / task / dashboard services
├── types/        User, Project, Task, DashboardStats, API envelopes
├── utils/        labels (enum -> friendly text), dates, error helpers, token storage
├── App.tsx       routes
└── main.tsx
```

## Authentication

- Login/register return a JWT, stored in `localStorage` (`pms.token`) and sent as `Authorization: Bearer <token>` by the Axios request interceptor.
- On startup the stored token is validated with `GET /auth/me`; an invalid or expired token clears the session and returns the user to `/login`.
- Any `401` on a protected call (except wrong-credentials on login/register) is handled centrally in the Axios response interceptor.
- Logout calls `POST /auth/logout` and always clears the local token (the API is stateless and has no server-side revocation).
- The token is never rendered in the UI.
