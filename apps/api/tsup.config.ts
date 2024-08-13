import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src"],
  format: "esm",
  outDir: "dev",
  bundle: false,
  platform: "node",
  clean: true,
  splitting: false,
  watch: true,
  onSuccess: "node --env-file .env dev/index.js",
  silent: true
});
