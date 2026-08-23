const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ENV = process.env.APP_ENV || process.env.NODE_ENV || "development";

const ENV_CONFIG = {
  development: {
    key: "dev",
    label: "Development",
    short: "DEV",
    color: "#0d9488",
    description: "Where code is written, tested locally, and integrated continuously.",
  },
  staging: {
    key: "stage",
    label: "Staging",
    short: "STAGE",
    color: "#d97706",
    description: "Production-like environment for final verification before release.",
  },
  production: {
    key: "prod",
    label: "Production",
    short: "PROD",
    color: "#e11d48",
    description: "Live environment serving real users with monitored, stable releases.",
  },
};

function resolveEnv(name) {
  const n = String(name || "").toLowerCase();
  if (n === "dev" || n === "development") return ENV_CONFIG.development;
  if (n === "stage" || n === "staging") return ENV_CONFIG.staging;
  if (n === "prod" || n === "production") return ENV_CONFIG.production;
  return ENV_CONFIG.development;
}

const currentEnv = resolveEnv(ENV);

const pipeline = [
  {
    id: "dev",
    ...ENV_CONFIG.development,
    steps: [
      "Write & commit code",
      "Run unit tests",
      "Lint & static analysis",
      "Build artifacts",
    ],
    learn: [
      "CI triggers on every push or pull request.",
      "Fast feedback catches bugs before they spread.",
      "Feature branches merge after green checks.",
    ],
  },
  {
    id: "stage",
    ...ENV_CONFIG.staging,
    steps: [
      "Deploy build artifact",
      "Run integration tests",
      "Smoke & E2E checks",
      "Manual / QA sign-off",
    ],
    learn: [
      "Mirrors production config, data shape, and infra.",
      "Validates the same binary that will go to prod.",
      "Reduces risk of surprise failures in production.",
    ],
  },
  {
    id: "prod",
    ...ENV_CONFIG.production,
    steps: [
      "Promote approved build",
      "Blue/green or rolling deploy",
      "Health checks & monitoring",
      "Rollback if needed",
    ],
    learn: [
      "Only tested, approved artifacts are released.",
      "Observability (logs, metrics, traces) is essential.",
      "CD automates safe, repeatable deployments.",
    ],
  },
];

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    env: currentEnv,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/pipeline", (_req, res) => {
  res.json({
    currentEnv,
    pipeline,
    concepts: {
      ci: "Continuous Integration — automate build, test, and merge validation on every change.",
      cd: "Continuous Delivery / Deployment — automate releasing validated builds through environments.",
      flow: "Code moves DEV → Stage → Prod. Each gate adds confidence before users see the change.",
    },
  });
});

app.get("/api/env/:name", (req, res) => {
  const env = resolveEnv(req.params.name);
  const detail = pipeline.find((p) => p.id === env.key);
  res.json(detail || env);
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`CI/CD Learning running on http://localhost:${PORT}`);
  console.log(`Active environment: ${currentEnv.short} (${currentEnv.label})`);
});
