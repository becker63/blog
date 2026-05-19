import tsParser from "@typescript-eslint/parser";
import styleFirewall from "../style-firewall.mjs";

/**
 * Scoped style firewall for `/admin` under `apps/blog/app` only.
 *
 * Runs via `bun run lint:admin`.
 * Keeps Hermes-aligned guardrails without switching the whole repo off `next lint`.
 */
export default [
  {
    ignores: ["**/styled-system/**", "**/node_modules/**", "**/.next/**"],
  },
  {
    files: [
      "apps/blog/app/admin/**/*.{ts,tsx}",
      "apps/blog/app/components/admin/**/*.{ts,tsx}",
    ],
    ignores: ["apps/blog/app/components/admin/ui/tokens.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "style-firewall": styleFirewall,
    },
    rules: {
      "style-firewall/site-status-bar-shared-chrome": "error",
      "style-firewall/navbar-chrome-layer-isolation": "error",
      "style-firewall/prefer-pane-parent-duplicate-stack": "error",
      "style-firewall/admin-private-page-no-root-fragment": "error",
      "style-firewall/admin-app-page-no-panda-styling": "error",
      "style-firewall/no-inline-style-except-geometry": "error",
      "style-firewall/no-raw-colors": "error",
      "style-firewall/no-raw-box-shadow": "error",
      "style-firewall/no-raw-border-radius": "error",
      "style-firewall/admin-no-redundant-root-back-link": "error",
      "style-firewall/no-styling-outside-ui": [
        "error",
        { allow: ["app/components/admin/ui"] },
      ],
      "style-firewall/no-surface-props-outside-recipes": "off",
      "style-firewall/prefer-panda-css": "warn",
    },
  },
];
