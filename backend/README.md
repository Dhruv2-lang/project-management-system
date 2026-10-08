# Project Management System — Backend API

REST API built with **Node.js, Express, TypeScript, PostgreSQL, Prisma, JWT and bcrypt**.
It serves both the React web app and the React Native (Expo) mobile app.

- API reference: [`docs/API.md`](../docs/API.md)
- Database design: [`docs/DATABASE.md`](../docs/DATABASE.md)
- Architecture: [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md)

## Requirements

- Node.js 18+ (developed on Node 22) and npm
- PostgreSQL 14+ (developed on 16)

## Installation

```bash
cd backend
npm install
cp .env.example .env        # then edit .env (see below)
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string, e.g. `postgresql://USER:PASSWORD@localhost:5432/project_management` |
| `JWT_SECRET` | yes | Secret for signing JWTs. Min 16 chars in dev, **32+ in production**. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | no | Token lifetime (default `7d`) |
| `PORT` | no | Server port (default `5000`) |
| `NODE_ENV` | no | `development` / `production` / `test` |
| `CLIENT_URL` | no | Allowed CORS origin(s), comma-separated (default `http://localhost:5173`). In development any `localhost` port is also allowed; in production only these origins are |
| `BCRYPT_ROUNDS` | no | bcrypt cost (default `12`) |
| `AUTH_RATE_LIMIT_MAX` | no | Max register/login requests per IP per window (default `10`) |
| `AUTH_RATE_LIMIT_WINDOW_MINUTES` | no | Auth rate-limit window (default `15`) |
| `API_RATE_LIMIT_MAX` | no | Max requests per IP per 15 min across `/api` (default `300`) |
| `TRUST_PROXY` | no | Number of reverse-proxy hops to trust (default `0`) |
| `TEST_DATABASE_URL` | tests only | Separate test database (its name must contain `test`; it gets wiped) |

`.env` is git-ignored. Never commit it. The server refuses to start if `DATABASE_URL` or `JWT_SECRET` is missing/weak.

## PostgreSQL setup

```bash
# Create a database and user (adjust names/passwords)
psql -U postgres -c "CREATE USER pms WITH PASSWORD 'choose_a_password';"
psql -U postgres -c "CREATE DATABASE project_management OWNER pms;"
# then set DATABASE_URL="postgresql://pms:choose_a_password@localhost:5432/project_management" in .env
```

## Prisma setup & migrations

```bash
npx prisma generate          # generate the Prisma Client      (npm run prisma:generate)
npx prisma migrate deploy    # apply the committed migrations  (npm run prisma:deploy)
npx prisma migrate dev       # development: apply + create new migrations (npm run prisma:migrate)
npx prisma studio            # optional: browse the data
```

For a fresh database run `npx prisma generate` then `npx prisma migrate deploy`.

The initial migration is `prisma/migrations/20261008000000_init/`. The generated client uses Prisma's Rust-free
`engineType = "client"` with the `@prisma/adapter-pg` driver adapter, so no native query-engine binary is needed at runtime.

> **Verification note:** the initial `migration.sql` was written following Prisma's output conventions and applied to
> PostgreSQL 16, where all 57 tests pass against it. It was not produced by the `prisma migrate` CLI itself (the build
> sandbox could not download Prisma's schema-engine binary). After your first `npx prisma migrate deploy`, run
> `npx prisma migrate dev` once: if it reports "Already in sync" nothing more is needed; if it offers to create a migration,
> the SQL differs only cosmetically from what Prisma would generate and you can accept it.

## Running locally

```bash
npm run dev          # watch mode (tsx) -> http://localhost:5000/api
npm run build        # compile TypeScript to dist/
npm start            # run the compiled build (use NODE_ENV=production)
npm run typecheck
```

- **API base URL:** `http://localhost:5000/api` (health check: `GET /api/health`)
- Android emulator reaches the host machine at `http://10.0.2.2:5000/api`; a physical device needs your machine's LAN IP.

## Testing

```bash
# 1. create a separate test database and apply the migration to it
psql -U postgres -c "CREATE DATABASE project_management_test OWNER pms;"
DATABASE_URL="postgresql://pms:choose_a_password@localhost:5432/project_management_test" npx prisma migrate deploy
# 2. set TEST_DATABASE_URL in .env, then:
npm test
```

57 automated tests (Vitest + Supertest, real PostgreSQL) cover auth, projects, tasks, dashboard, ownership isolation,
validation, SQL-injection-style input, rate limiting, CORS and security headers.

## Folder structure

```
backend/
├── prisma/            schema.prisma + migrations/
├── src/
│   ├── config/        env validation, Prisma client
│   ├── controllers/   thin HTTP handlers
│   ├── services/      business logic + all database access (ownership checks live here)
│   ├── middleware/    auth, validation, rate limiting, error handling
│   ├── routes/        route definitions
│   ├── validators/    zod schemas
│   ├── utils/         AppError, JWT, logger, response helpers
│   ├── types/         Express type augmentation
│   ├── app.ts         Express app factory (helmet, cors, routes, error handler)
│   └── server.ts      entry point
├── tests/             Vitest + Supertest
└── .env.example
```
