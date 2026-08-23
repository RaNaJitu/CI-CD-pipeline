/**
 * Standalone health check against a running app.
 * Usage: HEALTH_URL=http://127.0.0.1:3000/api/health node scripts/health-check.js
 */

const http = require("http");
const https = require("https");

const url = process.env.HEALTH_URL || "http://127.0.0.1:3000/api/health";
const timeoutMs = Number(process.env.HEALTH_TIMEOUT_MS || 20000);
const client = url.startsWith("https") ? https : http;

function check() {
  const started = Date.now();

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = client.get(url, (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          if (res.statusCode === 200) {
            resolve(body);
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
        reject(new Error(`Health check failed for ${url} after ${timeoutMs}ms (${reason})`));
        return;
      }
      setTimeout(attempt, 500);
    };

    attempt();
  });
}

check()
  .then((body) => {
    console.log("Health check PASSED");
    console.log(body);
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
