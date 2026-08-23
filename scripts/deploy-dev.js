/**
 * Promote the CI build artifact into DEV and verify with a health check.
 * Uses GitHub Environment vars/secrets — never hardcode secrets.
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const http = require("http");

const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");
const port = Number(process.env.PORT || 3010);
const healthUrl = process.env.HEALTH_URL || `http://127.0.0.1:${port}/api/health`;

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

function loadBuildInfo() {
  const infoPath = path.join(dist, "build-info.json");
  if (!fs.existsSync(infoPath)) {
    throw new Error("dist/build-info.json missing — download the versioned CI artifact first.");
  }
  if (!fs.existsSync(path.join(dist, "src", "server.js"))) {
    throw new Error("dist/src/server.js missing — artifact looks incomplete.");
  }
  return JSON.parse(fs.readFileSync(infoPath, "utf8"));
}

function waitForHealth(url, timeoutMs = 20000) {
  const started = Date.now();

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(url, (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          if (res.statusCode === 200) {
            try {
              resolve(JSON.parse(body));
            } catch {
              resolve({ status: "ok", raw: body });
            }
            return;
          }
          retry(`HTTP ${res.statusCode}`);
        });
      });

      req.on("error", (err) => retry(err.message));
      req.setTimeout(2000, () => {
        req.destroy();
        retry("timeout");
      });
    };

    const retry = (reason) => {
      if (Date.now() - started > timeoutMs) {
        reject(new Error(`Health check failed after ${timeoutMs}ms (${reason})`));
        return;
      }
      setTimeout(attempt, 500);
    };

    attempt();
  });
}

async function main() {
  const buildInfo = loadBuildInfo();

  console.log("Promoting artifact to DEV…");
  console.log(`  artifact:    ${buildInfo.artifactName}`);
  console.log(`  version:     ${buildInfo.version}`);
  console.log(`  gitSha:      ${buildInfo.gitSha}`);
  console.log(`  build #:     ${buildInfo.buildNumber}`);
  console.log(`  APP_ENV:     ${process.env.APP_ENV || "development"}`);
  console.log(`  NODE_ENV:    ${requireEnv("NODE_ENV")}`);
  console.log(`  API_URL:     ${requireEnv("API_URL")}`);
  console.log(`  DATABASE_URL:${mask(requireEnv("DATABASE_URL"))}`);
  console.log(`  DEPLOY_KEY:  ${mask(requireEnv("DEPLOY_KEY"))}`);
  console.log(`  API_SECRET:  ${mask(requireEnv("API_SECRET"))}`);

  const child = spawn("node", ["src/server.js"], {
    cwd: dist,
    env: {
      ...process.env,
      PORT: String(port),
      APP_ENV: process.env.APP_ENV || "development",
      NODE_ENV: process.env.NODE_ENV || "development",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (data) => process.stdout.write(`[dev-server] ${data}`));
  child.stderr.on("data", (data) => process.stderr.write(`[dev-server] ${data}`));

  let health;
  try {
    health = await waitForHealth(healthUrl);
    if (!health.build || health.build.artifactName !== buildInfo.artifactName) {
      throw new Error(
        `Health response did not match promoted artifact (expected ${buildInfo.artifactName}). ` +
          "Is another process bound to this port?"
      );
    }
    console.log("Health check PASSED:");
    console.log(`  status:  ${health.status}`);
    console.log(`  env:     ${health.env?.short || health.env?.label || "n/a"}`);
    console.log(`  build:   ${health.build.artifactName}`);
  } finally {
    child.kill("SIGTERM");
  }

  const promotion = {
    environment: "development",
    promotedAt: new Date().toISOString(),
    artifactName: buildInfo.artifactName,
    version: buildInfo.version,
    gitSha: buildInfo.gitSha,
    buildNumber: buildInfo.buildNumber,
    health,
  };

  const outDir = path.join(root, "promotions");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "dev.json");
  fs.writeFileSync(outFile, `${JSON.stringify(promotion, null, 2)}\n`);
  console.log(`Promotion record written: promotions/dev.json`);
  console.log("DEV deploy complete (same CI artifact promoted + health-checked).");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
