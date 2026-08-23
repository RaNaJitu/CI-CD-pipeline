const fs = require("fs");
const path = require("path");

/**
 * Build metadata written by scripts/build.js into dist/build-info.json.
 */
function loadBuildInfo() {
  const candidates = [
    path.join(__dirname, "..", "build-info.json"),
    path.join(process.cwd(), "build-info.json"),
  ];

  for (const infoPath of candidates) {
    try {
      if (fs.existsSync(infoPath)) {
        return JSON.parse(fs.readFileSync(infoPath, "utf8"));
      }
    } catch {
      // try next candidate
    }
  }

  return {
    version: process.env.APP_VERSION || "local",
    gitSha: process.env.GIT_SHA || "local",
    buildNumber: process.env.BUILD_NUMBER || "0",
    artifactName: process.env.ARTIFACT_NAME || "local-dev",
  };
}

module.exports = { loadBuildInfo };
