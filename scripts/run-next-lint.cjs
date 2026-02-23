"use strict";
const path = require("path");
const fs = require("fs");
const { spawnSync } = require("child_process");

const rootDir = path.join(__dirname, "..");
const webDir = path.join(rootDir, "apps", "web");

function findNextPackageDir() {
  for (const search of [webDir, rootDir]) {
    try {
      const pkgPath = require.resolve("next/package.json", { paths: [search] });
      return path.dirname(pkgPath);
    } catch {
      continue;
    }
  }
  const direct = [
    path.join(webDir, "node_modules", "next"),
    path.join(rootDir, "node_modules", "next"),
  ];
  for (const dir of direct) {
    if (fs.existsSync(path.join(dir, "package.json"))) return dir;
  }
  const pnpmDirs = [
    path.join(webDir, "node_modules", ".pnpm"),
    path.join(rootDir, "node_modules", ".pnpm"),
  ];
  for (const pnpmDir of pnpmDirs) {
    if (!fs.existsSync(pnpmDir)) continue;
    const entries = fs.readdirSync(pnpmDir, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isDirectory() || !e.name.startsWith("next@")) continue;
      const nextDir = path.join(pnpmDir, e.name, "node_modules", "next");
      if (fs.existsSync(path.join(nextDir, "package.json"))) return nextDir;
    }
  }
  return null;
}

function findNextBin(nextPkgDir) {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(nextPkgDir, "package.json"), "utf8")
    );
    const bin = pkg.bin;
    const binEntry = typeof bin === "string" ? bin : bin && bin.next;
    if (binEntry) {
      const candidate = path.resolve(nextPkgDir, binEntry);
      const withJs = candidate + (candidate.endsWith(".js") ? "" : ".js");
      if (fs.existsSync(candidate)) return candidate;
      if (fs.existsSync(withJs)) return withJs;
    }
  } catch {
    // ignore
  }
  const fallbacks = ["dist/bin/next", "dist/bin/next.js", "bin/next", "bin/next.js"];
  for (const rel of fallbacks) {
    const full = path.join(nextPkgDir, rel);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

function findEslintBin() {
  for (const search of [webDir, rootDir]) {
    try {
      const pkgPath = require.resolve("eslint/package.json", { paths: [search] });
      const dir = path.dirname(pkgPath);
      const bin = path.join(dir, "bin", "eslint.js");
      if (fs.existsSync(bin)) return bin;
    } catch {
      continue;
    }
  }
  const direct = [
    path.join(webDir, "node_modules", "eslint", "bin", "eslint.js"),
    path.join(rootDir, "node_modules", "eslint", "bin", "eslint.js"),
  ];
  for (const p of direct) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

// 1) Try next lint (next CLI)
const nextPkgDir = findNextPackageDir();
if (nextPkgDir) {
  const nextBinPath = findNextBin(nextPkgDir);
  if (nextBinPath) {
    const result = spawnSync(process.execPath, [nextBinPath, "lint"], {
      cwd: webDir,
      stdio: "inherit",
    });
    process.exit(result.status !== null ? result.status : 1);
  }
}

// 2) Fallback: run eslint directly (same as next lint uses)
const eslintBin = findEslintBin();
if (eslintBin) {
  const result = spawnSync(process.execPath, [
    eslintBin,
    ".",
    "--ext",
    ".js,.jsx,.ts,.tsx",
  ], {
    cwd: webDir,
    stdio: "inherit",
  });
  process.exit(result.status !== null ? result.status : 1);
}

console.error("Could not find next CLI or eslint. Run: pnpm install");
process.exit(1);
