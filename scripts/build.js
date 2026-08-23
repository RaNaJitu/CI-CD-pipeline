const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");

const runtimeFiles = ["server.js", "calculator.js", "package.json", "package-lock.json"];
const runtimeDirs = ["public"];

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

function writeProductionPackage() {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  const productionPkg = {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    main: "server.js",
    scripts: {
      start: "node server.js",
    },
    license: pkg.license,
    dependencies: pkg.dependencies || {},
  };
  fs.writeFileSync(
    path.join(dist, "package.json"),
    `${JSON.stringify(productionPkg, null, 2)}\n`
  );
}

console.log("Building application → dist/");
rmDir(dist);
fs.mkdirSync(dist, { recursive: true });

for (const file of runtimeFiles) {
  if (file === "package.json") continue;
  const src = path.join(root, file);
  if (fs.existsSync(src)) {
    copyFile(src, path.join(dist, file));
    console.log(`  + ${file}`);
  }
}

for (const dir of runtimeDirs) {
  const src = path.join(root, dir);
  if (fs.existsSync(src)) {
    copyDir(src, path.join(dist, dir));
    console.log(`  + ${dir}/`);
  }
}

writeProductionPackage();
console.log("  + package.json (production)");
console.log("Build complete.");
