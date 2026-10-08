# Database Design

PostgreSQL, managed with Prisma. Source of truth: `backend/prisma/schema.prisma`; SQL: `backend/prisma/migrations/`.

## Entity relationship

```
User 1 ──< Project 1 ──< Task
  └─────────────────────< Task      (a task also stores its owner's userId)
```

## Enums

| Enum | Values |
|---|---|
| `ProjectStatus` | `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED` |
| `TaskPriority` | `LOW`, `MEDIUM`, `HIGH` |
| `TaskStatus` | `PENDING`, `IN_PROGRESS`, `COMPLETED` |

## Tables

### User
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | generated |
| fullName | text | required |
| email | text | **unique**, stored lowercase |
| passwordHash | text | bcrypt hash — plaintext is never stored and never returned by the API |
| createdAt | timestamp | default now |

### Project
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| userId | UUID FK → User.id | owner, `ON DELETE CASCADE` |
| name | text | required |
| description | text | nullable |
| status | ProjectStatus | default `NOT_STARTED` |
| startDate, endDate | timestamp | nullable |
| createdAt | timestamp | default now |

### Task
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| userId | UUID FK → User.id | owner, `ON DELETE CASCADE` |
| projectId | UUID FK → Project | required; `ON DELETE CASCADE` |
| name | text | required |
| description | text | nullable |
| priority | TaskPriority | default `MEDIUM` |
| status | TaskStatus | default `PENDING` |
| dueDate | timestamp | nullable |
| createdAt | timestamp | default now |

## Foreign keys & referential integrity

| Constraint | Definition |
|---|---|
| `Project_userId_fkey` | `Project(userId)` → `User(id)` CASCADE |
| `Task_userId_fkey` | `Task(userId)` → `User(id)` CASCADE |
| `Task_projectId_userId_fkey` | `Task(projectId, userId)` → `Project(id, userId)` CASCADE (composite) |

The composite key is backed by a unique index `Project_id_userId_key`. It makes it **impossible at the database level**
for a task to reference a project owned by a different user — a second line of defence behind the application's ownership checks.

**Delete strategy:** deleting a project deletes its tasks (cascade); deleting a user deletes their projects and tasks.
The API documents this on `DELETE /projects/:id`.

## Ownership model

Every project and task row stores `userId`, taken from the verified JWT (never from the client). All reads and writes
include `userId` in the `WHERE` clause (`findFirst({ where: { id, userId } })`, `deleteMany({ where: { id, userId } })`),
so a row that belongs to someone else behaves exactly like a row that does not exist (HTTP 404).
Storing `userId` on `Task` keeps authorization a single-table check and makes dashboard counts a simple indexed filter.

## Indexes

| Index | Purpose |
|---|---|
| `User_email_key` (unique) | login lookup, uniqueness |
| `Project_userId_idx`, `Task_userId_idx` | owner scoping |
| `Task_projectId_idx` | tasks per project, joins |
| `Project_status_idx`, `Task_status_idx`, `Task_priority_idx` | filtering |
| `Project_userId_status_idx`, `Task_userId_status_idx` | dashboard grouped counts |
| `Project_id_userId_key` (unique) | target of the composite FK |

## Setup

```bash
cd backend
# create the database, set DATABASE_URL in .env, then:
npx prisma generate
npx prisma migrate deploy      # applies prisma/migrations/20261008000000_init
```
See `backend/README.md` for PostgreSQL user/database creation and the test database.

## SQL injection

All access goes through Prisma's parameterized query API. The only raw SQL is the constant `SELECT 1` health check
(a tagged template with no user input). No SQL is ever built from request data.
