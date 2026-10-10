# Project Management System

A full-stack project management application designed to help users organize projects, manage tasks, track progress, and view project-related information through a web interface.

**Live Demo:** [Project Management System](https://project-management-system-one-mu.vercel.app/)  
**Backend API:** [Render Backend](https://project-management-system-4j7i.onrender.com)  
**API Health Check:** [Check Backend Health](https://project-management-system-4j7i.onrender.com/api/health)  
**Source Code:** [GitHub Repository](https://github.com/Dhruv2-lang/project-management-system)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Overview](#api-overview)
- [Database Design](#database-design)
- [Security](#security)
- [Deployment](#deployment)
- [Testing](#testing)
- [Mobile Application Status](#mobile-application-status)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)

---

## Overview

The Project Management System is a web-based application built using a client-server architecture. It provides a centralized interface for managing projects and their associated tasks.

The application separates the user interface, backend processing, and database storage into distinct layers. This separation makes the system easier to maintain and provides a foundation for extending it to additional clients, including a mobile application.

The current web application is deployed on Vercel, while the backend API is deployed on Render and uses PostgreSQL for persistent storage.

## Features

The application is designed around the following capabilities:

### User Authentication
- User registration and login.
- Password hashing for secure credential storage.
- Token-based authentication for protected API operations.
- Authentication middleware for protected resources.

### Project Management
- Create and manage projects.
- Track project information and status.
- Organize project-related work in one place.

### Task Management
- Organize tasks under projects.
- Track task status and priority.
- Manage task-related information and due dates.

### Dashboard
- Provide a summary of project and task information.
- Support an overview of work and progress.

### API and Backend
- REST API built with Express.
- Modular route organization.
- Database access through Prisma ORM.
- Request validation and centralized error handling.
- Configurable API and authentication rate limiting.

*Note: The availability of individual features and their exact behavior should be verified against the current implementation.*

## Technology Stack

| Component | Technology | Purpose |
|---|---|---|
| Frontend | React | Builds the interactive user interface |
| Language | TypeScript | Adds static typing |
| Frontend tooling | Vite | Development server and production build |
| Styling | Tailwind CSS, where used | UI styling and responsive layouts |
| Backend runtime | Node.js | Executes server-side JavaScript |
| Backend framework | Express.js | Handles HTTP requests and API routes |
| Database | PostgreSQL | Persistent relational data storage |
| ORM | Prisma | Typed database access and schema management |
| Authentication | JWT | Token-based authentication |
| Password security | bcrypt | Password hashing |
| Web security | Helmet | Security-related HTTP headers |
| API protection | Rate limiting | Restricts excessive requests |
| Frontend hosting | Vercel | Hosts the web application |
| Backend hosting | Render | Runs the backend API |

## System Architecture

The application follows a client-server architecture.

```text
                 USER
                   |
                   v
       +------------------------+
       |   React + TypeScript   |
       |       Frontend         |
       |       (Vercel)         |
       +------------------------+
                   |
             HTTP / JSON
                   |
                   v
       +------------------------+
       |      Express API       |
       |       (Render)         |
       +------------------------+
                   |
          +--------+--------+
          |                 |
          v                 v
    Authentication    Application Routes
    and Middleware    Projects / Tasks /
                      Dashboard
          |                 |
          +--------+--------+
                   |
                   v
       +------------------------+
       |       Prisma ORM       |
       +------------------------+
                   |
                   v
       +------------------------+
       |   PostgreSQL Database  |
       +------------------------+
```

### Request Flow

1. The user interacts with the React frontend.
2. The frontend sends an HTTP request to the backend API.
3. Express receives the request and routes it to the relevant handler.
4. Middleware performs the applicable authentication and request-processing checks.
5. The backend uses Prisma to interact with PostgreSQL.
6. The backend returns a response to the frontend.
7. The frontend updates the user interface based on the response.

The frontend does not connect directly to PostgreSQL. Database access is handled by the backend.

## Project Structure

The repository is organized into separate directories for the backend, web application, mobile application, and documentation.

```text
project-management-system/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   └── package.json
├── web/
├── mobile/
├── docs/
├── .gitignore
└── README.md
```

*This is a high-level representation of the repository structure. Individual files may differ from this outline.*

### Backend Components

- **`server.ts`** — initializes the database connection and starts the HTTP server.
- **`app.ts`** — configures Express, middleware, API routes, and error handling.
- **`routes/`** — organizes endpoints by feature.
- **`controllers/`** — intended for handling incoming requests and preparing responses.
- **`services/`** — intended for reusable application or business logic.
- **`middleware/`** — provides reusable request processing, including authentication and error handling.
- **`config/`** — contains application and database configuration.
- **`utils/`** — contains reusable helper functions.
- **`prisma/schema.prisma`** — defines the Prisma data models and relationships.

## Prerequisites

Before running the project locally, install:

- [Node.js](https://nodejs.org/)
- npm, included with Node.js
- [PostgreSQL](https://www.postgresql.org/)
- Git
- A code editor such as Visual Studio Code

Use a Node.js version compatible with the dependencies specified by the project.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Dhruv2-lang/project-management-system.git
cd project-management-system
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure environment variables

Create a local `.env` file based on the provided example:

```bash
cp .env.example .env
```

Edit `.env` with your local PostgreSQL connection details and appropriate development secrets.

Do not commit your `.env` file or publish production credentials.

### 4. Prepare the database

Make sure PostgreSQL is running and the database exists. Configure `DATABASE_URL` in the backend environment file to point to the correct local database.

Generate the Prisma client:

```bash
npx prisma generate
```

Apply the existing development migrations:

```bash
npx prisma migrate dev
```

If the repository's migrations have already been created and you only need to apply them without creating a new migration, follow the project's migration workflow instead.

### 5. Start the backend

From the `backend/` directory, run the development script configured in `package.json`:

```bash
npm run dev
```

The port is controlled by the application's configuration. The API is mounted under `/api`.

### 6. Start the frontend

Open a second Terminal window:

```bash
cd project-management-system/web
npm install
npm run dev
```

If the frontend uses a different package manager or script, follow the scripts declared in `web/package.json`.

Configure the frontend API URL using the environment-variable name expected by the frontend code. For a Vite application, client-exposed variables commonly use the `VITE_` prefix.

For local development, the API URL should point to your local backend.

## Environment Configuration

The backend's example configuration includes variables such as the following. Use the actual names and requirements in `backend/.env.example`.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign authentication tokens |
| `JWT_EXPIRES_IN` | Token expiration configuration |
| `PORT` | HTTP server port |
| `CLIENT_URL` | Allowed frontend origin or origins |
| `BCRYPT_ROUNDS` | bcrypt hashing cost configuration |
| `AUTH_RATE_LIMIT_MAX` | Authentication rate-limit configuration |
| `TRUST_PROXY` | Reverse-proxy trust configuration |
| `NODE_ENV` | Application environment |

Example format:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/project_management"
JWT_SECRET="replace-with-a-long-random-development-secret"
JWT_EXPIRES_IN="1d"
PORT=5000
CLIENT_URL="http://localhost:5173"
BCRYPT_ROUNDS=12
NODE_ENV="development"
```

This is an illustrative configuration, not a substitute for the complete `.env.example` file. Additional variables may be required.

**Security:** Never use the example JWT secret in production. Do not commit real secrets, passwords, or database connection strings to GitHub.

## Database Setup

The application uses PostgreSQL for relational data storage and Prisma for database access.

### Inspect the Prisma schema

From the backend directory:

```bash
npx prisma studio
```

Prisma Studio opens a browser-based interface for inspecting and editing database records.

Alternatively, connect through PostgreSQL's command-line client:

```bash
psql project_management
```

Useful PostgreSQL commands:

```sql
\dt
```

Lists tables in the current schema.

```sql
SELECT * FROM "Project" LIMIT 10;
```

Example query only; use the actual table names defined by your schema.

```sql
\q
```

Exits the PostgreSQL client.

The local database and deployed database are separate unless explicitly configured to use the same database. Always verify which database your connection string points to before inspecting or changing data.

## API Overview

The backend API is mounted under `/api`.

### Health Check

```http
GET /api/health
```

Checks backend availability and database connectivity.

Live endpoint:

[https://project-management-system-4j7i.onrender.com/api/health](https://project-management-system-4j7i.onrender.com/api/health)

### Authentication

The API includes an authentication route group:

```text
/api/auth
```

The intended authentication operations include registration, login, logout, and retrieving the current user's identity. Consult the route implementation for exact paths, request bodies, and response formats.

### Projects

```text
/api/projects
```

The project route group handles project-related operations and is protected by authentication middleware.

### Tasks

```text
/api/tasks
```

The task route group handles task-related operations and is protected by authentication middleware.

### Dashboard

```text
/api/dashboard
```

The dashboard route group provides dashboard-related information and is protected by authentication middleware.

For all route groups, consult the backend source code for the exact supported HTTP methods, endpoint paths, required fields, and response schemas.

## Database Design

The application uses a relational database to store related information.

Conceptually, its core entities include:

- **Users** — account and authentication-related information.
- **Projects** — information about projects managed by users.
- **Tasks** — individual work items associated with projects.

A simplified relationship is:

```text
Users
  |
  | One user may own multiple projects
  v
Projects
  |
  | One project may contain multiple tasks
  v
Tasks
```

Primary keys identify records, while foreign keys can represent relationships between records. The exact fields, constraints, and deletion behavior are defined by the Prisma schema and migrations.

## Security

Security-related controls configured in the backend include:

- **Password hashing:** bcrypt is used for password hashing.
- **Token authentication:** JWT-based authentication is used for protected operations.
- **Authentication middleware:** protects the project, task, and dashboard route groups.
- **CORS:** restricts browser access according to configured origins.
- **Helmet:** sets security-related HTTP headers.
- **Rate limiting:** limits excessive API and authentication requests.
- **Centralized error handling:** provides a common mechanism for handling request failures.
- **Environment configuration:** keeps deployment-specific settings outside application source code.

Resource-level authorization and server-side validation are also important: an authenticated user should only be able to access resources they are permitted to use.

## Deployment

### Frontend — Vercel

The web application is deployed at:

[https://project-management-system-one-mu.vercel.app/](https://project-management-system-one-mu.vercel.app/)

The frontend uses its configured API URL to communicate with the backend.

### Backend — Render

The backend API is deployed at:

[https://project-management-system-4j7i.onrender.com](https://project-management-system-4j7i.onrender.com)

The health endpoint can be used to check backend and database connectivity.

### Deployment Configuration

The backend deployment requires appropriate environment variables, including its PostgreSQL connection string, JWT configuration, and allowed frontend origin.

Production configuration should use secure secrets and the correct database credentials.

## Testing

Testing is important for verifying application behavior and preventing regressions.

Useful areas to test include:

- Registration and login.
- Invalid credentials and validation errors.
- Requests without valid authentication.
- Project creation and modification.
- Task creation and status updates.
- Authorization and ownership checks.
- Database connectivity and error handling.
- Frontend-to-backend integration.

Run tests using the scripts declared in the relevant `package.json` files. Test commands and current test coverage should be confirmed from the repository.

## Mobile Application Status

The repository includes a `mobile/` directory for the intended mobile client, but the mobile application has not yet been built and configured.

The backend API is designed to provide a central interface for application data and can serve as the foundation for a future mobile client. The mobile application will still require implementation, secure token storage, API integration, and device testing.

## Troubleshooting

### PostgreSQL reports that the role `postgres` does not exist

Your local PostgreSQL installation may use a different database role. Try connecting with your configured local username or inspect your PostgreSQL roles.

### The backend cannot connect to PostgreSQL

Check that PostgreSQL is running, that the database exists, and that `DATABASE_URL` contains the correct connection information.

### Prisma reports a missing table

Ensure the application is using the intended database and that the necessary migrations have been applied.

### The frontend cannot reach the backend

Check the frontend API URL, backend availability, CORS configuration, and the browser's network console.

### The `/api` URL returns route not found

The API is mounted under `/api`, but a root handler may not be defined for that exact path. Test a defined endpoint such as `/api/health`.

### The deployed backend takes time to respond

A hosted service may take longer to respond after a period of inactivity, depending on its hosting plan and configuration.

## Future Improvements

Potential improvements include:

- Complete the mobile application.
- Expand automated integration testing.
- Add pagination and sorting where appropriate.
- Improve monitoring and operational logging.
- Expand API documentation.
- Add audit logging for important changes.
- Improve mobile error handling and secure token storage.
- Review authorization and validation coverage across all resource operations.

---

## License

A license has not been specified in this README. Add the appropriate license file and update this section if the project is intended to be distributed under an open-source license.

## Author

Developed as a full-stack Project Management System project.

For questions, bug reports, or suggestions, please use the repository's GitHub Issues section.
