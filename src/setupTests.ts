import "@testing-library/jest-dom/vitest"; // Pre-import
import { loadEnvFile } from "node:process";
import path from "node:path";

loadEnvFile(path.join(process.cwd(), ".env.local"));

// jsdom does not have ResizeObserver. A no-op stub is enough because jsdom has no layout.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
