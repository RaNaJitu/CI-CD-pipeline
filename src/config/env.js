/**
 * Environment labels used across the learning UI and /api/health.
 */

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

function getRuntimeEnv() {
  return resolveEnv(process.env.APP_ENV || process.env.NODE_ENV || "development");
}

module.exports = {
  ENV_CONFIG,
  resolveEnv,
  getRuntimeEnv,
};
