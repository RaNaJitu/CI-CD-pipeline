/**
 * DEV deploy step — uses GitHub Environment vars/secrets.
 * Never hardcode secrets here or in the workflow YAML.
 */

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Add it under Settings → Environments → development (variable or secret).`
    );
  }
  return value;
}

function mask(value) {
  if (!value) return "(empty)";
  if (value.length <= 8) return "***";
  return `${value.slice(0, 4)}…${value.slice(-2)}`;
}

console.log("Deploying to DEV environment…");
console.log(`  APP_ENV:     ${process.env.APP_ENV || "development"}`);
console.log(`  NODE_ENV:    ${requireEnv("NODE_ENV")}`);
console.log(`  API_URL:     ${requireEnv("API_URL")}`);
console.log(`  DATABASE_URL:${mask(requireEnv("DATABASE_URL"))}`);
console.log(`  DEPLOY_KEY:  ${mask(requireEnv("DEPLOY_KEY"))}`);
console.log(`  API_SECRET:  ${mask(requireEnv("API_SECRET"))}`);
console.log("  Artifact:    dist/ (downloaded from CI build)");
console.log("DEV deploy checks passed. (Wire real host/SSH/cloud deploy here later.)");
