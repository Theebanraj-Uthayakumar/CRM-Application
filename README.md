# CRM Prototype

This repository contains a thin, full-stack CRM prototype implemented with a clean architecture approach. It exposes a RESTful API for managing customer accounts (backed by PostgreSQL + Prisma) and a React SPA that consumes the API and provides full CRUD workflows.

## Stack

- **Backend:** Node.js, TypeScript, Express 5, Prisma, Zod, Jest/Supertest
- **Frontend:** React 19, Vite, TanStack Query, Vitest, Playwright
- **Database:** PostgreSQL with Prisma migrations

## Project Layout

```
/
├── backend/   # REST API + business logic
└── frontend/  # React single-page application
```

## Prerequisites

- Node.js 20+ (tested with v23.5) and npm 10+
- PostgreSQL 14+ running locally or accessible via connection string

## Setup Instructions

### Backend

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create an environment file based on `env.example`, then adjust `DATABASE_URL`:
   ```bash
   cp env.example .env
   ```
3. Prepare the database (local instructions below) and generate the Prisma client:
   ```bash
   npm run prisma:migrate:dev
   npm run prisma:generate
   ```

### Frontend

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. (Optional) Copy `env.example` to `.env` and override `VITE_API_URL` if the API runs on a different host.

### API Surface

- `GET /api/customers` – list accounts
- Supports `search` query parameter powered by a PostgreSQL `tsvector` column and GIN index for full-text search across name, email, and location fields.
- `GET /api/customers/:id` – fetch a single account
- `POST /api/customers` – create an account (validates required fields and unique email)
- `PUT /api/customers/:id` – update an account (partial updates with validation)
- `DELETE /api/customers/:id` – remove an account

Interactive OpenAPI docs are published at `http://localhost:4000/docs`, with the raw JSON available at `http://localhost:4000/docs.json`.

Errors are normalized JSON responses with appropriate HTTP status codes.

## How to Run the Application

### Local development

1. Launch the backend:
   ```bash
   cd backend
   npm run dev
   ```
   The API runs on `http://localhost:4000` and exposes customer endpoints under `/api/customers`.
2. In another terminal, start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```
   Visit `http://localhost:5173`. Vite proxies `/api` requests to the backend, so both servers must run simultaneously.

### Docker Compose

To run the full stack (database + API + SPA) with containers:

```bash
docker compose up --build
```

Published ports:
- `http://localhost:4000` – Express API (also hosts Swagger UI at `/docs`)
- `http://localhost:5173` – React SPA served via Nginx and reverse-proxying `/api`

Stop and optionally wipe the database volume:
```bash
docker compose down         # keep data
docker compose down -v      # remove postgres volume
```

Modify environment values in `docker-compose.yml` or supply an `--env-file` to point at external infrastructure (e.g., AWS RDS).

## Environment Variables

| Service   | Variable        | Description                                                | Default                                  |
|-----------|-----------------|------------------------------------------------------------|------------------------------------------|
| Backend   | `DATABASE_URL`  | PostgreSQL connection string used by Prisma               | `postgresql://postgres:postgres@db:5432/crm` (docker) |
| Backend   | `PORT`          | HTTP port for Express                                      | `4000`                                   |
| Frontend  | `VITE_API_URL`  | Base path for API calls (used at build time by Vite)       | `/api`                                   |

- For local development, copy the respective `env.example` files inside `backend/` and `frontend/` and adjust values as needed.
- When running with Docker Compose against an external database (e.g., AWS RDS), override `DATABASE_URL` in `docker-compose.yml` or via `docker compose --env-file`.
- The frontend container proxies `/api` traffic to the backend service, so no additional configuration is required unless you expose the API publicly.

## How to Run Tests

### Backend

- Unit + integration tests with Jest/Supertest:
  ```bash
  cd backend
  npm test
  ```

### Frontend

- Component/unit tests with Vitest + Testing Library:
  ```bash
  cd frontend
  npm test
  ```

### End-to-End

- Playwright E2E suite (requires both backend and frontend servers running):
  ```bash
  cd frontend
  npx playwright install --with-deps
  npm run test:e2e
  ```

## Notes

- Prisma generates a typed repository, and the service layer enforces validation, unique constraints, and caches list queries with a short-lived in-memory cache that is invalidated after mutations.
- The frontend relies on TanStack Query for client-side caching and mutations, giving automatic state refreshes after CRUD operations.
- For production, configure environment variables (ports, API base URL) and consider seeding scripts or containerization as needed.

## Database Setup & Migrations

Prisma migrations live in `backend/prisma/migrations/` and include an additional search index rollout.

### Local database

1. Ensure PostgreSQL is running (e.g., `postgres://postgres:postgres@localhost:5432/crm`).
2. From `backend/`, apply migrations and generate the client:
   ```bash
   npm run prisma:migrate:dev
   npm run prisma:generate
   ```

### Cloud / external database

When pointing the backend at a remote database (for example AWS RDS), deploy schema changes with:

```bash
npm run prisma:migrate:deploy
```

The Docker entrypoint performs this command automatically on startup to keep the schema current.

## AI Workflow Summary

- **Planning & scaffolding:** Leveraged Cursor’s agent to explore the repo, outline architecture decisions, and quickly scaffold service/repository layers.
- **Incremental implementation:** Used AI-assisted edits for repetitive boilerplate (controllers, Prisma models) while manually verifying business rules and TypeScript types.
- **Testing & verification:** Triggered test suites (`npm test`, `npm run build`) via the assistant, iterating on failures until green.
- **Enhancements:** Prompted AI for suggestions when adding advanced features (full-text search, Swagger docs, caching) and refined the generated output to maintain clean architecture boundaries.
- **Documentation & automation:** Asked the assistant to draft README sections and container configurations, then adjusted details to match the actual workflow and infrastructure requirements.

