# User Registration App — Angular + .NET Core Microservice

A small full-stack demo:

- **`backend/UserService`** — an ASP.NET Core 8 minimal-API microservice that exposes
  `POST /api/auth/register` and `POST /api/auth/login`. Passwords are salted + hashed
  with PBKDF2 (built-in .NET crypto, no external packages needed). Users are kept in a
  thread-safe in-memory store, so the service runs with **zero dependencies** — swap in
  EF Core + a real database later for production.
- **`frontend`** — an Angular 18 standalone-component app with a Register page and a
  Login page, both backed by reactive forms and a typed `AuthService`.

```
UserRegistrationApp/
├── backend/
│   └── UserService/          # .NET 8 microservice
├── frontend/                 # Angular app
└── .github/workflows/        # CI: build + optional auto-deploy
```

## Run it locally

### 1. Backend (UserService)

```bash
cd backend/UserService
dotnet run
```

Runs at **http://localhost:5000**. Try it:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Jane Doe","email":"jane@example.com","password":"secret123"}'
```

### 2. Frontend (Angular)

```bash
cd frontend
npm install
npm start
```

Opens at **http://localhost:4200**. The app calls the API at the URL configured in
`src/environments/environment.ts` (`http://localhost:5000/api` by default).

## Running tests

### Backend (xUnit)

```bash
cd backend/UserService.Tests
dotnet test
```

Covers `PasswordHasher` (hashing/verification), `InMemoryUserStore` (add/find/case-insensitive
lookup), and full HTTP integration tests for `/api/auth/register`, `/api/auth/login`, and
`/health` via `WebApplicationFactory` (spins up the real pipeline in-memory, no server needed).

### Frontend (Jasmine/Karma)

```bash
cd frontend
npm run test        # interactive, watches for changes, opens Chrome
npm run test:ci      # single run, headless — used in CI
```

Covers `AuthService` (HTTP calls + error-message mapping via `HttpClientTestingModule`),
`RegisterComponent` and `LoginComponent` (form validation, submit behavior, success/error
paths using a mocked `AuthService`), and a smoke test for `AppComponent`.

Both suites run automatically in `.github/workflows/deploy.yml` on every push/PR, before
the build/deploy steps.

## API summary

| Method | Route                | Body                                   | Notes                        |
|--------|-----------------------|-----------------------------------------|-------------------------------|
| POST   | `/api/auth/register`  | `{ fullName, email, password }`         | 201 on success, 409 if email taken |
| POST   | `/api/auth/login`     | `{ email, password }`                   | 200 with user, 401 if invalid |
| GET    | `/api/users`          | —                                        | List registered users (demo)  |
| GET    | `/health`             | —                                        | Health check                  |

## Adding more microservices

This is set up so you can add sibling services under `backend/` (e.g. `ProfileService`,
`NotificationService`), each its own `.csproj` with its own port, and have the Angular
app call them all — that's the "microservices" shape at small scale. For real
inter-service routing, put an API gateway (YARP, or Ocelot) in front of them.

## Deploying with GitHub Actions (auto-run on push)

A workflow at `.github/workflows/deploy.yml` runs on every push/PR to `main`:

1. **`backend`** — builds `UserService` and runs the xUnit test suite (`UserService.Tests`).
2. **`build-frontend`** — installs npm packages, runs the Jasmine/Karma test suite, then
   builds the Angular app and uploads it as a Pages artifact.
3. **`deploy-frontend`** — deploys to GitHub Pages, but only runs if **both** jobs above
   succeed (`needs: [backend, build-frontend]`). A failing unit test in either project
   blocks the deploy — it never reaches this step.

Wire up the backend's own deploy step for wherever you're hosting it:

- **Frontend** → GitHub Pages (already included) or any static host (Netlify, Vercel, S3).
- **Backend** → Azure App Service, Render, Fly.io, or a container registry + VPS —
  .NET Web APIs aren't static, so GitHub Pages can't host `UserService` itself. The
  commented-out `Deploy to Azure App Service` step in the `backend` job shows where to
  add this once you have a target and the `AZURE_WEBAPP_PUBLISH_PROFILE` secret.

**Required one-time setup:** in the repo, go to **Settings → Pages** and set
**Source → GitHub Actions** (not "Deploy from a branch") — this workflow deploys via
GitHub's OIDC-based Pages action, not a `gh-pages` branch push.
