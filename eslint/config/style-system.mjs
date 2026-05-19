import nextPlugin from "@next/eslint-plugin-next";
import tsParser from "@typescript-eslint/parser";
import styleFirewall from "../style-firewall.mjs";

/**
 * Style-system firewall for the whole Next app (`apps/blog/app/**`).
 *
 * Runs after `next lint` via `bun run lint`.
 * Agents must not bypass: shared status chrome, navbar layer, pane stacks.
 */
export default [
  {
    ignores: [
      "**/styled-system/**",
      "**/node_modules/**",
      "**/.next/**",
    ],
  },
  {
    files: ["apps/blog/app/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "@next/next": nextPlugin,
      "style-firewall": styleFirewall,
    },
    rules: {
      // Define Next rules referenced in file-level eslint-disable comments (first pass uses eslint-config-next).
      "@next/next/no-img-element": "off",
      "style-firewall/site-status-bar-shared-chrome": "error",
      "style-firewall/navbar-chrome-layer-isolation": "error",
      "style-firewall/prefer-pane-parent-duplicate-stack": "error",
      "style-firewall/admin-private-page-no-root-fragment": "error",
      "style-firewall/admin-app-page-no-panda-styling": "error",
    },
  },
];
