# CI/CD Learning — Node.js App

Interactive learning UI that explains how software moves through **DEV → Stage → Prod**.

## Roadmap status

```text
PHASE 1  Done — CI basics
PHASE 2  Done — Quality (CodeQL, audit, Dependabot; Sonar optional / paused)
PHASE 3  Done — Versioned artifact + promote same tarball
PHASE 4  Done — DEV EC2 deploy + health
PHASE 5  Done (in repo) — STAGE EC2 deploy + smoke/integration
PHASE 6  Done (in repo) — PROD (tag + approval + rollback)
PHASE 7  Pending — Pro CI/CD (OIDC, concurrency hardening, etc.)
```

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
├── scripts/                 # Build / deploy / health / rollback tools
├── dist/                    # Packaged artifact (gitignored)
├── jest.config.js
├── eslint.config.js
└── sonar-project.properties # Kept for optional SonarQube Cloud later
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
  → Quality (audit, lint, tests, coverage)
  → Build → dist/
  → Package → versioned .tar.gz
  → Upload artifact (GitHub Actions)
  → Promote SAME .tar.gz → DEV (push develop) / STAGE (push main) / PROD (tag v*)
  → Health / smoke checks
```

**Build once, deploy many times** — DEV/STAGE/PROD should all get the same tarball shape, not three separate build recipes.

> **SonarQube Cloud:** not required in CI right now. `sonar-project.properties` remains if you re-enable a scan later with a valid User `SONAR_TOKEN`.

### Branch / tag → environment

| Event | CI | Deploy |
|-------|----|--------|
| PR → `develop` or `main` | Quality & Build | none |
| Push → `develop` | Quality & Build | **DEV** (`development`) |
| Push → `main` | Quality & Build | **STAGE** (`staging`) |
| Push tag `v*.*.*` | Quality & Build | **PROD** (`production`, **approval required**) |

PRs into `main` must come from `develop` or `hotfix/*` (workflow **Allowed source branch**).

### Debug deploy (DEV / STAGE)

Deploy runs **only on push**, not on PR:

| Job | When |
|-----|------|
| Deploy to DEV | push to `develop` |
| Deploy to STAGE | push to `main` |

**1. Confirm IP ↔ environment secret**

- Instance `43.204.231.45` must match **Environment → development or staging → `EC2_HOST`**
- Same env must have `EC2_USER`, `EC2_SSH_KEY` (base64)
- On the box: `/opt/cicd-learning/shared/.env` must exist (deploy.sh links it)

**2. Confirm a deploy job actually ran**

GitHub → Actions → latest run on `develop`/`main` → open **Deploy to DEV** or **Deploy to STAGE**.  
If the job is **Skipped**, you only ran a PR (no deploy). Merge to the branch first.

**3. Read the new preflight logs**

Deploy jobs print:

- hostname / public IP guess (compare to `43.204.231.45`)
- `/opt/cicd-learning` and `/tmp/cicd-learning`
- whether `shared/.env` exists
- pm2 + port 3010
- after upload: tarball present under `/tmp/cicd-learning/`
- after deploy: `current` symlink + health

**4. If SSH works but `/tmp` stays empty**

Upload step failed, or Actions targeted a **different** `EC2_HOST` than the box you SSH into.

**5. Manual dry-run (same as Actions)**

```bash
# after CI built an artifact, or local: npm run build && ARTIFACT_NAME=app-local npm run package
scp -i KEY -o IdentitiesOnly=yes artifacts/ARTIFACT.tar.gz ubuntu@HOST:/tmp/cicd-learning/
ssh -i KEY -o IdentitiesOnly=yes ubuntu@HOST "bash /opt/cicd-learning/deploy.sh ARTIFACT"
```

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

CI uploads that `.tar.gz`. DEV/STAGE download and extract the **same file** (no rebuild).

## Phase 4 — DEV

Create GitHub Environment **`development`**:

| Type | Names |
|------|--------|
| Variables | `NODE_ENV`, `API_URL` |
| Secrets | `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY` |

Deploy runs on **push to `develop`** only.

CodeQL and Dependabot still run separately. `SONAR_TOKEN` is not required for Quality & Build while Sonar is paused.

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

## Phase 5 — STAGE

Create GitHub Environment **`staging`** (second EC2, same layout as DEV):

| Type | Names |
|------|--------|
| Variables | `NODE_ENV`, `API_URL` |
| Secrets | `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY` |

Use the **STAGE** host/key values (not the DEV ones). Prefer base64 for `EC2_SSH_KEY` (same as Phase 4).

On the STAGE instance, mirror DEV:

- `/opt/cicd-learning/deploy.sh`
- `/tmp/cicd-learning/` for uploaded tarballs
- App listens on `http://127.0.0.1:3010`

Deploy runs on **push to `main`** only. After deploy, CI runs:

1. **Smoke:** `GET /api/health` (must include the promoted artifact name)
2. **Integration:** `GET /api/pipeline` must succeed

## Phase 6 — PROD (approval + tag + rollback)

### 1. GitHub Environment `production`

Settings → Environments → **New environment** → name: `production`

| Type | Names |
|------|--------|
| Variables | `NODE_ENV`, `API_URL` |
| Secrets | `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY` |

**Required reviewers:** add yourself (or teammates). This is the approval gate — Deploy to PROD waits until someone approves in the Actions UI.

Use a **third EC2** (or clearly separate host) with the same layout as DEV/STAGE:

- `/opt/cicd-learning/deploy.sh`
- `/opt/cicd-learning/ecosystem.config.js`
- `/opt/cicd-learning/shared/.env`
- `/tmp/cicd-learning/`
- App on `http://127.0.0.1:3010`

### 2. Install rollback script on PROD

From this repo:

```bash
scp -i KEY -o IdentitiesOnly=yes scripts/rollback.sh ubuntu@PROD_HOST:/opt/cicd-learning/rollback.sh
ssh -i KEY -o IdentitiesOnly=yes ubuntu@PROD_HOST "chmod +x /opt/cicd-learning/rollback.sh"
```

### 3. Release with a version tag (from `main`)

```bash
git checkout main
git pull origin main
# optional: bump package.json version to match
git tag v1.0.0
git push origin v1.0.0
```

That starts **Node CI** → Quality & Build → **Deploy to PROD** (waits for environment approval) → smoke checks.

Artifact version comes from the tag (`v1.0.0` → `app-1.0.0-<sha>-<run>.tar.gz`).

### 4. Rollback

**Option A — GitHub Actions (recommended)**  
Actions → **Rollback PROD** → Run workflow → leave `artifact_name` empty for **previous** release, or paste a release folder name from `/opt/cicd-learning/releases`. Approve the `production` environment when prompted.

**Option B — SSH**

```bash
ssh ubuntu@PROD_HOST "bash /opt/cicd-learning/rollback.sh"           # previous
ssh ubuntu@PROD_HOST "bash /opt/cicd-learning/rollback.sh app-1.0.0-abc1234-12"  # specific
```

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
