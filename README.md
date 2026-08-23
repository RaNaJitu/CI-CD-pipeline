# CI/CD Learning — Node.js App

Interactive learning UI that explains how software moves through **DEV → Stage → Prod**.

## Project layout

```text
.
├── .github/                 # Actions + Dependabot
├── src/                     # Application source
│   ├── config/              # Env + build metadata
│   ├── data/                # Learning content
│   ├── lib/                 # Domain helpers (calculator)
│   ├── routes/              # HTTP API
│   ├── app.js               # Express app factory
│   └── server.js            # Process entrypoint
├── public/                  # Static UI
├── test/unit/               # Jest unit tests
├── scripts/                 # Build / deploy / health tools
├── dist/                    # Packaged artifact (gitignored)
├── jest.config.js
├── eslint.config.js
└── sonar-project.properties
```

## Run locally

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run lint
npm test -- --coverage
npm run build
npm run audit
```

## Pipeline

```
Source
  → Quality (audit, lint, tests, coverage, Sonar, gate)
  → Version + Build → dist/
  → Store versioned artifact
  → Promote SAME artifact → DEV
  → Health check
```

## Phase 3 — Artifact

Artifact name: `app-<version>-<git-sha>-<run-number>`

Stored in Actions; DEV downloads that exact name (no rebuild).

## Phase 4 — DEV

Create GitHub Environment **`development`**:

| Type | Names |
|------|--------|
| Variables | `NODE_ENV`, `API_URL` |
| Secrets | `DATABASE_URL`, `DEPLOY_KEY`, `API_SECRET` |

Repo secret: `SONAR_TOKEN`

## API

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health + env + build info |
| `GET /api/pipeline` | CI/CD learning content |
| `GET /api/env/:name` | Detail for `dev`, `stage`, or `prod` |
