# project-management-system

A project and task management system with a REST API backend, a React web app and a React Native (Expo) mobile app.

## Repository layout

| Folder | Status | Description |
|---|---|---|
| [`backend/`](backend/README.md) | done | Express + TypeScript + Prisma + PostgreSQL REST API |
| `web/` | pending | React web application |
| `mobile/` | pending | React Native (Expo) Android application |
| [`docs/`](docs/) | backend docs done | [API](docs/API.md), [Database](docs/DATABASE.md), [Architecture](docs/ARCHITECTURE.md) |

## Quick start (backend)

```bash
cd backend
npm install
cp .env.example .env          # set DATABASE_URL and JWT_SECRET
npx prisma generate
npx prisma migrate deploy
npm run dev                   # http://localhost:5000/api
```

See [`backend/README.md`](backend/README.md) for full setup, environment variables and testing.

