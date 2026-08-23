# CI/CD Learning — Node.js App

Interactive learning UI that explains how software moves through **DEV → Stage → Prod**.

## Run locally

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Pipeline

```
Source
  → npm ci
  → Dependency audit (+ Dependabot / Dependency Review on PRs)
  → ESLint
  → Unit tests + Coverage
  → SonarCloud + Quality Gate
  → Build + Artifact
  → Deploy DEV (main only)
```

Parallel: **CodeQL** workflow (SAST) → results in **Security → Code scanning**.

## Phase 2 — Quality

| Check | How |
|-------|-----|
| ESLint | `npm run lint` |
| Unit tests + coverage | `npm test -- --coverage` |
| Dependency audit | `npm run audit` (also in CI; report artifact `npm-audit-report`) |
| Dependabot | `.github/dependabot.yml` (weekly npm + Actions updates) |
| Dependency Review | PR-only step in CI (fails on high severity) |
| CodeQL | `.github/workflows/codeql.yml` |
| SonarCloud + Quality Gate | Needs repo secret `SONAR_TOKEN` |

Artifacts from CI: `coverage-report`, `npm-audit-report`, `app-build`.

## DEV environment

DEV deploy runs only on pushes to `main`, after CI succeeds. It uses the GitHub Environment named **`development`**.

1. Repo → **Settings** → **Environments** → **New environment** → `development`
2. **Variables:** `NODE_ENV=development`, `API_URL=https://dev-api.example.com`
3. **Secrets:** `DATABASE_URL`, `DEPLOY_KEY`, `API_SECRET`
4. Repo secret: `SONAR_TOKEN`

Never put secret values in YAML — use `${{ secrets.* }}` and `${{ vars.* }}`.

## Switch environment labels (local)

```bash
APP_ENV=development npm start   # DEV (default)
APP_ENV=staging npm start       # STAGE
APP_ENV=production npm start    # PROD
```

## API

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health + current env |
| `GET /api/pipeline` | Full pipeline + CI/CD concepts |
| `GET /api/env/:name` | Detail for `dev`, `stage`, or `prod` |
