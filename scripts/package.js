/**
 * Create ONE canonical deployable tarball from dist/.
 *
 * Build once → package once → promote the same .tar.gz to DEV / STAGE / PROD.
 *
 * Output: artifacts/<ARTIFACT_NAME>.tar.gz
 * Example: artifacts/app-1.0.0-a82f91c-152.tar.gz
 */

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");
const outDir = path.join(root, "artifacts");

if (!fs.existsSync(dist)) {
  console.error("dist/ missing. Run npm run build first.");
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(path.join(dist, "package.json"), "utf8"));
const buildInfoPath = path.join(dist, "build-info.json");
const buildInfo = fs.existsSync(buildInfoPath)
  ? JSON.parse(fs.readFileSync(buildInfoPath, "utf8"))
  : {};

const artifactBase =
  process.env.ARTIFACT_NAME || buildInfo.artifactName || `app-${pkg.version}-local-0`;
const tarballName = artifactBase.endsWith(".tar.gz")
  ? artifactBase
  : `${artifactBase}.tar.gz`;
const tarballPath = path.join(outDir, tarballName);

fs.mkdirSync(outDir, { recursive: true });

// Remove older local tarballs so only the current canonical artifact remains.
for (const file of fs.readdirSync(outDir)) {
  if (file.endsWith(".tar.gz")) {
    fs.unlinkSync(path.join(outDir, file));
  }
}
const legacyRootTarball = path.join(root, "node-app.tar.gz");
if (fs.existsSync(legacyRootTarball)) {
  fs.unlinkSync(legacyRootTarball);
}

console.log("Packaging canonical application artifact…");
console.log(`  source:   dist/`);
console.log(`  tarball:  ${tarballName}`);

execFileSync("tar", ["-czf", tarballPath, "dist"], { cwd: root, stdio: "inherit" });

const sizeKb = Math.round(fs.statSync(tarballPath).size / 1024);
console.log(`  size:     ${sizeKb} KB`);
console.log(`  wrote:    artifacts/${tarballName}`);
console.log("Package complete (single artifact).");
