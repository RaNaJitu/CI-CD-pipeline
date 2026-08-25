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
npm run build      # → dist/
npm run package    # → artifacts/app-<version>-<sha>-<run>.tar.gz  (ONE canonical artifact)
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
artifacts/app-1.0.0-a82f91c-152.tar.gz   ← the only artifact
```

CI uploads that `.tar.gz`. DEV downloads and extracts the **same file** (no rebuild).
## Phase 4 — DEV

Create GitHub Environment **`development`**:

| Type | Names |
|------|--------|
| Variables | `NODE_ENV`, `API_URL` |
| Secrets | `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY` |

**Repository secrets** (Settings → Secrets → Actions): `SONAR_TOKEN`

### EC2_SSH_KEY format (important)

`error in libcrypto` means the private key secret is invalid/corrupted.

**Recommended: store base64 (single line)**

On your Mac, with the EC2 private key file (example `cicd-ec2.pem`):

```bash
# confirm it is a private key
head -n 1 cicd-ec2.pem
# should print: -----BEGIN ... PRIVATE KEY-----

# copy base64 to clipboard
base64 -i cicd-ec2.pem | tr -d '\n' | pbcopy
```

Then in GitHub → Environment **development** → secret **EC2_SSH_KEY** → paste that single line → Save.

Also install the matching public key on EC2:

```bash
ssh-keygen -y -f cicd-ec2.pem >> ~/.ssh/authorized_keys
```

(run that on the instance, or append the `.pub` content into `authorized_keys`)

### Dependency scanning (current)

- **Hard gate in CI:** `npm audit --audit-level=high`
- **Ongoing updates:** `.github/dependabot.yml`

GitHub **Dependency Review** was removed from the workflow because this repo does not have Dependency graph enabled yet. To add it later:

1. [Enable Dependency graph](https://github.com/RaNaJitu/CI-CD-pipeline/settings/security_analysis)
2. Add a PR-only step using `actions/dependency-review-action@v5`

## API

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health + env + build info |
| `GET /api/pipeline` | CI/CD learning content |
| `GET /api/env/:name` | Detail for `dev`, `stage`, or `prod` |
