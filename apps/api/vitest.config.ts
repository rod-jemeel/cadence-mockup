import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "api",
    root: ".",
    exclude: ["dist/**", "node_modules/**"],
  },
});
