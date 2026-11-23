#!/usr/bin/env node
"use strict";

/**
 * Create the ignored Python environment used only by CP05 Admin-1 comparison
 * tests. This script is deliberately opt-in: no production build or gameplay
 * path starts Python, downloads packages, or reads this environment.
 */
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const environment = path.join(root, ".cp05-python");
const requirements = path.join(__dirname, "cp05-python-requirements.txt");
const interpreter = process.env.CP05_BOOTSTRAP_PYTHON || "python3.13";
const python = path.join(environment, "bin", "python");

function run(command, args) {
  execFileSync(command, args, { cwd: root, stdio: "inherit" });
}

if (!fs.existsSync(python)) {
  run(interpreter, ["-m", "venv", environment]);
}

run(python, ["-m", "pip", "install", "--requirement", requirements]);
run(python, [
  "-c",
  "import shapefile, shapely; print(f'CP05 Python ready: pyshp {shapefile.__version__}, shapely {shapely.__version__}')",
]);
