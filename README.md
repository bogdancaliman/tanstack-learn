# Tanstack Learn

Backend: Bun + Hono API with Drizzle ORM (Bun SQLite) and better-auth for sign-up/sign-in. User CRUD is implemented as HTTP handlers; user creation is done via better-auth sign-up.

---

## Bootstrap (how this was implemented)

- **Runtime:** Bun.
- **HTTP:** Hono (app, CORS, routes in `backend/src/index.ts`).
- **Database:** SQLite via `bun:sqlite` and Drizzle (`drizzle-orm/bun-sqlite`). Schema in `backend/src/db/schema.ts` (user, session, account, verification) matches better-auth’s Drizzle adapter.
- **Auth:** better-auth with Drizzle adapter and email/password, mounted at `/api/auth/*`.
- **User CRUD:** Handlers in `backend/src/handlers/users.ts`; list, get-by-id, update, delete. Create user = better-auth sign-up only (no separate `POST /api/users`).
- **Migrations:** Schema applied with `drizzle-kit generate` and `drizzle-kit push` (or migrate). Config in `backend/drizzle.config.ts`.

---

## Environment (.env)

Create a `.env` file in the `backend` folder (it’s gitignored). Copy from `backend/.env.sample` and fill in values. Each field:

| Variable | Purpose |
|----------|---------|
| `DB_FILE_NAME` | Path to the SQLite file (e.g. `./db.sqlite` or `./local.sqlite`). Used by the app and by `drizzle.config.ts` for migrations. |
| `BETTER_AUTH_SECRET` | Secret for signing sessions/tokens. Use a long random string (e.g. 32+ chars). Required for production. |
| `BETTER_AUTH_URL` | Public URL of this API (e.g. `http://localhost:3000`). Used for trusted origins and redirects. |

Optional:

- `PORT` – If you start the server with something that reads it (e.g. `Bun.serve({ port: process.env.PORT ?? 3000 })`).

Load order: `dotenv/config` is imported in `backend/src/index.ts` and in `backend/src/db/index.ts`, so env is loaded when the app runs.

---

## Running the project

### Devbox

From the **project root** (where `devbox.json` lives):

```sh
devbox shell
```

This installs and uses **Bun** as defined in `devbox.json`. Then:

```sh
cd backend
bun install
bun run dev
```

### Without Devbox

Ensure Bun is installed, then from the project root:

```sh
cd backend
bun install
bun run dev
```

The dev script runs `bun run --hot src/index.ts` from `backend`. If the app only exports the Hono app and does not call `Bun.serve`, you need to start the HTTP server (e.g. add `Bun.serve({ fetch: app.fetch, port: process.env.PORT ?? 3000 })` in `backend/src/index.ts` or in the file that runs the app). Then open `http://localhost:3000` (or your `PORT`).

---

## Testing the endpoints

Use Postman (or any HTTP client). Base URL: `http://localhost:3000` (or your `PORT`).

### Auth

| Action | Method | URL | Body (JSON) |
|--------|--------|-----|-------------|
| Sign up | `POST` | `/api/auth/sign-up/email` | `{ "email": "test@example.com", "password": "secret123", "name": "Test User" }` |
| Sign in | `POST` | `/api/auth/sign-in/email` | `{ "email": "test@example.com", "password": "secret123" }` |
| Get session | `GET` | `/api/auth/get-session` | — (send cookies) |

Set `Content-Type: application/json` for POST bodies. Enable “Send cookies” in Postman so the session cookie is sent for get-session.

### User CRUD

| Action | Method | URL | Body (JSON) |
|--------|--------|-----|-------------|
| List users | `GET` | `/api/users` | — |
| Get one user | `GET` | `/api/users/:id` | — |
| Update user | `PATCH` | `/api/users/:id` | `{ "name": "Updated Name" }` or `{ "image": "https://..." }` |
| Delete user | `DELETE` | `/api/users/:id` | — |

Use the user `id` from sign-up response or from `GET /api/users`. Delete removes the user and related session/account rows. Update returns 404 if the user is not found; same for get-one and delete.

Suggested flow: sign up → sign in → get-session → list users → get one → patch → delete (then list again to confirm).
