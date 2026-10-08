# Architecture

## Overview

```
 React web app ─┐                                   ┌──────────────┐
                ├── HTTPS + JSON + Bearer JWT ──▶  Express API ──▶ Prisma ──▶ PostgreSQL
 React Native ──┘          (CORS, rate limits)     └──────────────┘
```

Both clients are stateless consumers of the same REST API under `/api`.

## Backend layers

| Layer | Folder | Responsibility |
|---|---|---|
| Entry / app | `src/server.ts`, `src/app.ts` | DB connect, Helmet, CORS, body parsing, rate limiting, route mounting, error handler |
| Routes | `src/routes/` | URL → middleware chain → controller |
| Middleware | `src/middleware/` | `authenticate` (JWT), `validate` (zod), rate limiters, centralized `errorHandler` |
| Validators | `src/validators/` | zod schemas for bodies/queries; strip unknown fields (so `userId` from clients is dropped) |
| Controllers | `src/controllers/` | Thin: read request → call service → format response |
| Services | `src/services/` | Business rules, **ownership checks**, all Prisma queries |
| Data | `prisma/`, `src/config/prisma.ts` | Schema, migrations, client |

Request flow: `route → rate limit → authenticate → validate → controller → service → Prisma → response`.
Any thrown error reaches `errorHandler`, which returns `{ success:false, message, errors? }` with the right status.

## Authentication flow

1. `POST /auth/register` or `/auth/login`: password validated, hashed (or compared) with **bcrypt**; a **JWT** (HS256, `sub = userId`, 7-day expiry) signed with `JWT_SECRET` is returned with the safe user profile.
2. The client stores the token (web: memory/storage; mobile: `expo-secure-store`) and sends `Authorization: Bearer <token>`.
3. `authenticate` verifies signature, algorithm and expiry, then loads the user from the database. Deleted users' tokens are rejected. `req.user` is set from this trusted data.
4. Logout is client-side (discard token). There is deliberately no server-side revocation list; this is documented in the API.

Login failures return one generic message and compare against a dummy hash when the email is unknown, limiting user enumeration.

## Authorization flow

- The acting user id is **only** `req.user.id` from the JWT.
- Every service query is scoped by it (`where: { id, userId }`). Non-owned or unknown ids both return 404.
- Creating or moving a task verifies the target project belongs to the same user.
- The database enforces the same rule with the composite foreign key `(projectId, userId)`.
- Dashboard metrics are `groupBy` counts filtered by `userId`.

## Security controls

Helmet headers · CORS allow-list (`CLIENT_URL`; localhost only in development) · rate limiting (strict on register/login, broad on the API) ·
zod validation · 100 kb body limit · bcrypt · JWT algorithm pinned · secrets only from environment · generic 500 messages (no stack traces to clients) ·
Prisma parameterized queries.

## API structure

`/api/health`, `/api/auth/*`, `/api/projects[/:id]`, `/api/tasks[/:id]`, `/api/dashboard` — see [API.md](API.md).

## Notes for web / mobile clients

- Base URL from config (`http://localhost:5000/api` locally; Android emulator: `http://10.0.2.2:5000/api`).
- Add the web origin to `CLIENT_URL`. React Native requests carry no `Origin` header, so CORS does not apply to them.
- Treat any `401` on a protected call as "session ended": clear the token and go to login.
- Show `errors[].field/message` from `422` responses next to form fields.
