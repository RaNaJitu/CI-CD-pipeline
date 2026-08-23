/**
 * Package runtime app into dist/ for CI artifact promotion.
 *
 * Layout:
 *   dist/
 *     src/          ← application code
 *     public/       ← static UI
 *     package.json
 *     package-lock.json
 *     build-info.json
 */

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");

function rmDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else {
      copyFile(from, to);
    }
  }
}

function resolveBuildInfo(pkg) {
  const version = process.env.APP_VERSION || pkg.version;
  const gitSha = process.env.GIT_SHA || "local";
  const buildNumber = process.env.BUILD_NUMBER || "0";
  const artifactName =
    process.env.ARTIFACT_NAME || `app-${version}-${gitSha}-${buildNumber}`;

  return {
    name: pkg.name,
    version,
    gitSha,
    buildNumber: String(buildNumber),
    artifactName,
    builtAt: new Date().toISOString(),
  };
}

function writeProductionPackage(pkg, buildInfo) {
  const productionPkg = {
    name: pkg.name,
    version: buildInfo.version,
    description: pkg.description,
    main: "src/server.js",
    scripts: {
      start: "node src/server.js",
    },
    license: pkg.license,
    dependencies: pkg.dependencies || {},
  };
  fs.writeFileSync(
    path.join(dist, "package.json"),
    `${JSON.stringify(productionPkg, null, 2)}\n`
  );
}

function writeBuildInfo(buildInfo) {
  fs.writeFileSync(
    path.join(dist, "build-info.json"),
    `${JSON.stringify(buildInfo, null, 2)}\n`
  );
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const buildInfo = resolveBuildInfo(pkg);

console.log("Building application → dist/");
console.log(`  version:  ${buildInfo.version}`);
console.log(`  gitSha:   ${buildInfo.gitSha}`);
console.log(`  build #:  ${buildInfo.buildNumber}`);
console.log(`  artifact: ${buildInfo.artifactName}`);

rmDir(dist);
fs.mkdirSync(dist, { recursive: true });

copyDir(path.join(root, "src"), path.join(dist, "src"));
console.log("  + src/");

copyDir(path.join(root, "public"), path.join(dist, "public"));
console.log("  + public/");

copyFile(path.join(root, "package-lock.json"), path.join(dist, "package-lock.json"));
console.log("  + package-lock.json");

writeProductionPackage(pkg, buildInfo);
writeBuildInfo(buildInfo);
console.log("  + package.json (production)");
console.log("  + build-info.json");
console.log("Build complete.");
