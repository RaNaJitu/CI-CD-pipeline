# CI/CD Learning — Node.js App

Interactive learning UI that explains how software moves through **DEV → Stage → Prod**.

## Run locally

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Switch environment labels

The header shows the active runtime environment:

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
