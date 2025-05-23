/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { defineConfig, UserConfig } from 'vitest/config'; // Use vitest/config for specific test config
import react from '@vitejs/plugin-react';
import path from 'path';
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal"; // Restored
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
// https://vitest.dev/config/

export default defineConfig(async (): Promise<UserConfig> => {
  const isCi = process.env.CI === 'true';

  return {
    plugins: [
      react(),
      runtimeErrorOverlay(), // Restored
      tailwindcss({ config: path.resolve(__dirname, 'tailwind.config.ts') }), // Added explicit config path
      ...(process.env.NODE_ENV !== "production" &&
      process.env.REPL_ID !== undefined
        ? [
            (await import("@replit/vite-plugin-cartographer")).cartographer(),
          ]
        : []),
    ],
    server: {
      fs: {
        // Allow serving files from the entire project directory and its parent
        allow: [
          path.resolve(__dirname),
          path.resolve(__dirname, 'client'),
          path.resolve(__dirname, 'client/src'),
        ],
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
        // Alias for server tests to correctly resolve server-side code from the tests directory
        "server": path.resolve(__dirname, "server"),
      },
    },
    // Vite specific config (applies when running `vite dev` or `vite build`)
    root: path.resolve(__dirname, "client"),
    build: {
      outDir: path.resolve(__dirname, "dist/public"),
      emptyOutDir: true,
    },
    // Vitest specific config (applies when running `vitest`)
    test: {
      globals: true,
      // Default environment for client-side tests (jsdom)
      environment: "jsdom",
      setupFiles: "./client/src/test/setup.ts", // Relative to project root
      css: true,
      reporters: isCi ? ['default', 'junit'] : ['default', 'html'],
      outputFile: isCi ? './junit-report.xml' : undefined,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        include: ["client/src/**/*.{ts,tsx}", "server/**/*.ts"], // Coverage for both client and server
        exclude: [
          "coverage/**",
          "dist/**",
          "**/*.test.{ts,tsx}",
          "**/*.config.{js,ts}",
          "**/node_modules/**",
          "**/.*/**",
          "client/src/test/setup.ts",
          "scripts/**",
          "shared/**/index.ts", // Often just exports
          "server/index.ts", // Entry point, often less about testable logic
          "server/vite.ts", // Vite specific, not app logic
          "server/auth.ts", // Potentially mock-heavy, consider separate integration tests
          "server/storage/seed.ts", // Seeding script
        ],
        all: true, // Ensure all files in `include` are considered for coverage, even if not tested
      },
      // Define separate test configurations using `name` and `environment`
      // This allows running tests with different environments in the same `vitest` command.
      // Client-side tests (default, can be omitted if it's the main config)
      // Vitest will run tests matching include patterns in their respective environments.
      // However, true project-based parallel execution with different envs per project
      // is more a feature of Vitest Workspaces (vitest.workspace.ts)
      // For a single config, we can use include/exclude and environment overrides in scripts.
      // Let's simplify and assume we will use separate commands for client and server tests
      // if environments cannot be reliably switched with include/exclude alone.

      // This `include` is for client tests, which will use the top-level `environment: 'jsdom'`
      include: ["client/src/**/*.test.{ts,tsx}"],

      // To run server tests in a node environment, you would typically use a separate config
      // or a command that overrides the environment, e.g.:
      // vitest --environment node --config ./vitest.server.config.ts
      // Or, if Vitest supports it well enough, use include/exclude with environment flags.
      // For now, this config primarily targets client tests.
      // We will add a separate script for server tests.
    },
  };
});
