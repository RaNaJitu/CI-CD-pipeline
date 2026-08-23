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
  → Build → dist/
  → Package → node-app.tar.gz (versioned)
  → Upload artifact (GitHub Actions)
  → Promote SAME .tar.gz → DEV
  → Health check
```

**Build once, deploy many times** — DEV/STAGE/PROD should all get the same tarball, not three separate builds.

## Phase 3 — Build and store the artifact

```bash
npm run build      # → dist/ (src, public, package.json, lock, build-info)
npm run package    # → artifacts/<name>.tar.gz + node-app.tar.gz
```

What gets packaged:

```text
dist/
├── src/
├── public/
├── package.json
├── package-lock.json
└── build-info.json
        ↓
   node-app.tar.gz   ← the artifact
```

CI uploads that `.tar.gz`. DEV downloads and extracts the **same file** (no rebuild).

Versioned name: `app-<version>-<git-sha>-<run-number>.tar.gz`  
Stable learning name: `node-app.tar.gz`
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
