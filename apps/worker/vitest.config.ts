import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "worker",
    root: ".",
    exclude: ["dist/**", "node_modules/**"],
  },
});
