# API Reference

**Base URL (local):** `http://localhost:5000/api`
All request and response bodies are JSON (`Content-Type: application/json`). IDs are UUIDs. Dates are ISO 8601 strings.

## Conventions

**Success**
```json
{ "success": true, "message": "optional text", "data": { } }
```
List endpoints also include `"count"`. `data` is `null` for deletes/logout.

**Error**
```json
{ "success": false, "message": "Human readable message", "errors": [ { "field": "email", "message": "Email must be a valid email address" } ] }
```
`errors` is present only for validation failures (422).

**Authentication.** Send `Authorization: Bearer <token>` on every endpoint except `register`, `login`, `logout`, `health`.
The user is always identified from the token; `userId` in request bodies is ignored.

**Unknown body fields are ignored** (stripped). Strings are trimmed.

### HTTP status codes

| Code | Meaning |
|---|---|
| 200 / 201 | Success / created |
| 400 | Malformed JSON, or malformed `:id` (not a UUID) |
| 401 | Missing, invalid or expired token; wrong login credentials |
| 403 | Reserved — not currently returned (see note below) |
| 404 | Not found **or not owned by you** (see note below); unknown route |
| 409 | Email already registered |
| 413 | Request body larger than 100 kb |
| 422 | Validation failed (`errors` lists each field) |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error (generic message, details only in server logs) |

> **Ownership returns 404, not 403.** Requesting another user's project/task gives the same `404` as a non-existent id,
> so attackers cannot discover which ids exist.

---

## Health

`GET /health` — public. `200 { "success": true, "data": { "status": "ok", "database": "connected" } }`

## Authentication

### POST /auth/register  (rate limited)
Body: `fullName` (1–100), `email` (valid, stored lowercase), `password` (8–72 chars, at least one letter and one number).
```json
{ "fullName": "Alice Smith", "email": "alice@example.com", "password": "Passw0rdOK" }
```
`201`
```json
{ "success": true, "message": "Registration successful",
  "data": { "user": { "id": "uuid", "fullName": "Alice Smith", "email": "alice@example.com", "createdAt": "2026-10-08T07:22:24.266Z" },
            "token": "eyJhbGciOi..." } }
```
Errors: `409` email exists, `422` invalid input, `429` rate limited.

### POST /auth/login  (rate limited)
Body: `email`, `password`. `200` returns the same `data` shape as register (`user` + `token`).
Wrong email **or** password → `401 "Invalid email or password"` (same message for both).

### POST /auth/logout
No authentication needed. `200 { "success": true, "message": "Logged out. Discard the stored token on the client; ...", "data": null }`
JWTs are stateless and **there is no server-side revocation**: the client must delete its token. The token stays technically valid until it expires (default 7 days).

### GET /auth/me  (auth)
`200 { "success": true, "data": { "user": { "id", "fullName", "email", "createdAt" } } }` — `401` if token missing/invalid/expired.

---

## Projects (auth required, own projects only)

Project object:
```json
{ "id": "uuid", "name": "Website Redesign", "description": "New site", "status": "IN_PROGRESS",
  "startDate": "2026-01-01T00:00:00.000Z", "endDate": "2026-06-30T00:00:00.000Z",
  "createdAt": "2026-10-08T07:22:24.300Z", "taskCount": 3 }
```
`status`: `NOT_STARTED` (default) | `IN_PROGRESS` | `COMPLETED`.

| Method & path | Description |
|---|---|
| `GET /projects` | List my projects, newest first. Query: `search` (matches name or description, case-insensitive), `status`. Filters combine with AND. → `{ data: [...], count }` |
| `GET /projects/:id` | One project. `404` if not found/not mine |
| `POST /projects` | Create. Body: `name` (required, ≤150), `description` (≤2000), `status`, `startDate`, `endDate` → `201` |
| `PUT /projects/:id` | Partial update of any of those fields (≥1 required). `null` clears description/dates |
| `DELETE /projects/:id` | Deletes the project **and all its tasks** (cascade) |

Validation: `endDate` must be on/after `startDate` (checked against stored values on update too); dates must be real calendar dates (`2026-02-31` is rejected).

Examples
```
GET /projects?search=website
GET /projects?status=IN_PROGRESS
GET /projects?search=website&status=IN_PROGRESS
```

## Tasks (auth required, own tasks only)

Task object:
```json
{ "id": "uuid", "projectId": "uuid", "name": "Write report", "description": "Quarterly",
  "priority": "HIGH", "status": "PENDING", "dueDate": "2026-11-01T00:00:00.000Z",
  "createdAt": "2026-10-08T07:22:24.400Z", "project": { "id": "uuid", "name": "Website Redesign" } }
```
`priority`: `LOW` | `MEDIUM` (default) | `HIGH`. `status`: `PENDING` (default) | `IN_PROGRESS` | `COMPLETED`.

| Method & path | Description |
|---|---|
| `GET /tasks` | List my tasks, newest first. Query: `search` (task name, case-insensitive), `status`, `priority`, `projectId`. Filters combine with AND → `{ data: [...], count }` |
| `GET /tasks/:id` | One task |
| `POST /tasks` | Create. Body: `projectId` (required, must be **my** project), `name` (required, ≤150), `description`, `priority`, `status`, `dueDate` → `201` |
| `PUT /tasks/:id` | Partial update of `name`, `description`, `priority`, `status`, `dueDate`, `projectId` (new project must also be mine). Mark done with `{ "status": "COMPLETED" }` |
| `DELETE /tasks/:id` | Delete a task |

A `projectId` that does not exist or belongs to someone else returns `404 "Project not found"`.

Examples
```
GET /tasks?search=report
GET /tasks?status=COMPLETED
GET /tasks?priority=HIGH
GET /tasks?projectId=<uuid>&status=PENDING&priority=HIGH
```

## Dashboard (auth)

`GET /dashboard` →
```json
{ "success": true, "data": { "totalProjects": 3, "totalTasks": 3, "completedTasks": 1,
                             "pendingTasks": 1, "inProgressTasks": 1, "projectsInProgress": 2 } }
```
- `pendingTasks` = tasks with status `PENDING`; `inProgressTasks` (extra) = `IN_PROGRESS`; so `pending + inProgress + completed = totalTasks`.
- `projectsInProgress` = projects with status `IN_PROGRESS`.
- Computed in the database with grouped counts, scoped to the authenticated user.

## Rate limits

- `POST /auth/register` and `POST /auth/login`: 10 requests / 15 min / IP combined (configurable) → `429`
- Everything under `/api`: 300 requests / 15 min / IP
- Standard `RateLimit-*` headers are returned.
