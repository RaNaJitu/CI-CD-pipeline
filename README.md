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
Source → Lint → Test → Coverage → Sonar → Quality Gate → Build → Artifact → Deploy DEV
```

DEV deploy runs only on pushes to `main`, and only after CI succeeds. It uses the GitHub Environment named **`development`**.

## Step 17 — Create the `development` environment

In GitHub (do this in the UI — do not put secret values in YAML):

1. Open the repo → **Settings** → **Environments** → **New environment**
2. Name it exactly: `development`
3. Add **Environment variables** (non-secret):

| Name | Example value |
|------|----------------|
| `NODE_ENV` | `development` |
| `API_URL` | `https://dev-api.example.com` |

4. Add **Environment secrets** (sensitive):

| Name | Purpose |
|------|---------|
| `DATABASE_URL` | DEV database connection |
| `DEPLOY_KEY` | Deploy credential / SSH key |
| `API_SECRET` | API secret for DEV |

Also keep repo secret `SONAR_TOKEN` for the quality job (repo-level is fine).

Repo secrets / env secrets are referenced in the workflow as `${{ secrets.NAME }}` and `${{ vars.NAME }}` — never as plain text.

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
