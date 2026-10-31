import { cpSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

// Classic scripts depend on shared global lexical bindings and must remain ordered.
export default defineConfig({
  base: "./",
  publicDir: false,
  build: { sourcemap: false },
  plugins: [
    {
      name: "copy-classic-runtime",
      writeBundle() {
        mkdirSync(resolve("dist/js"), { recursive: true });
        for (const file of [
          "data.js",
          "state.js",
          "audio.js",
          "ui.js",
          "modes.js",
          "game.js",
          "events.js",
          "navigation-core.js",
          "navigation.js",
        ]) {
          cpSync(resolve("js", file), resolve("dist/js", file));
        }
        for (const dir of ["svg", "assets"]) {
          cpSync(resolve(dir), resolve("dist", dir), {
            recursive: true,
            filter: (source) =>
              !source.endsWith(".DS_Store") &&
              (source === resolve(dir) || !source.endsWith("/svg/svg")),
          });
        }
      },
    },
  ],
  test: { include: ["tests/unit/**/*.test.ts"] },
});
