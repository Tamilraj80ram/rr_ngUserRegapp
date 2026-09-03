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

A workflow at `.github/workflows/deploy.yml` builds both projects on every push to
`main`. Wire up the deploy steps for wherever you're hosting:

- **Frontend** → GitHub Pages (already included) or any static host (Netlify, Vercel, S3).
- **Backend** → Azure App Service, Render, Fly.io, or a container registry + VPS —
  .NET Web APIs aren't static, so GitHub Pages can't host `UserService` itself.

See the workflow file for the exact steps and which repo secrets to add
(e.g. `AZURE_WEBAPP_PUBLISH_PROFILE`).
