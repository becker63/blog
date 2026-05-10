export type WorkflowFile = {
  filename: string;
  workflow: Record<string, unknown>;
};

const setupSteps = [
  { uses: "actions/checkout@v4" },
  { uses: "DeterminateSystems/nix-installer-action@main" },
  {
    uses: "cachix/cachix-action@v15",
    if: "${{ env.CACHIX_AUTH_TOKEN != '' }}",
    with: {
      name: "${{ vars.CACHIX_CACHE_NAME || 'becker63' }}",
      authToken: "${{ env.CACHIX_AUTH_TOKEN }}",
    },
  },
  { run: "nix develop --command pnpm install --frozen-lockfile" },
];

const nix = (command: string) => `nix develop --command ${command}`;

const nixBash = (commands: string[]) => {
  /** Double-quote -c script so the runner sees `$VAR`; escape `$` expansion on the GH runner (`$GITHUB_*`) via backslash — inner bash must expand them. */
  const body = commands
    .join("\n")
    .replace(/\\/g, "\\\\")
    .replace(/\$/g, "\\$")
    .replace(/"/g, '\\"');
  return `nix develop --command bash -lc "${body}"`;
};

/** Safer bot push: staged-only commits, pull --rebase before push, one retry after conflict. Expects `RI_GIT_BRANCH` in the step env (see generated workflows). */
const commitAndPushSteps = ({
  gitAddPaths,
  message,
}: {
  gitAddPaths: string[];
  message: string;
}) =>
  nixBash([
    `set -eu`,
    `git config user.name "github-actions[bot]"`,
    `git config user.email "github-actions[bot]@users.noreply.github.com"`,
    `BRANCH="$RI_GIT_BRANCH"`,
    `git fetch origin "$BRANCH" --prune || true`,
    `( git pull --rebase origin "$BRANCH" || git pull --rebase ) || true`,
    `git add ${gitAddPaths.join(" ")}`,
    `if git diff --cached --quiet; then exit 0; fi`,
    `git commit -m ${JSON.stringify(message)}`,
    `( git pull --rebase origin "$BRANCH" || git pull --rebase ) || true`,
    `git push || { ( git pull --rebase origin "$BRANCH" || git pull --rebase ) || true; git push; }`,
  ]);

const commitRepoInsightStateStep = {
  name: "Commit repo insight state",
  env: {
    RI_GIT_BRANCH: "${{ github.ref_name }}",
  },
  run: commitAndPushSteps({
    gitAddPaths: ["data/taste-profile.md", "data/repo-insight-poll-state.json", "data/repo-insight-budget-state.json"],
    message: "Update repo insight state",
  }),
};

const commitAggregatorBudgetStep = {
  name: "Commit budget state if changed",
  env: {
    RI_GIT_BRANCH: "${{ github.ref_name }}",
  },
  run: commitAndPushSteps({
    gitAddPaths: ["data/repo-insight-budget-state.json"],
    message: "Update repo insight budget state",
  }),
};

export const workflowDefinitions: WorkflowFile[] = [
  {
    filename: "automation-check.yml",
    workflow: {
      name: "Automation Check",
      on: {
        pull_request: null,
        push: {
          branches: ["main"],
        },
      },
      permissions: {
        contents: "read",
      },
      jobs: {
        check: {
          "runs-on": "ubuntu-latest",
          env: {
            CACHIX_AUTH_TOKEN: "${{ secrets.CACHIX_AUTH_TOKEN }}",
          },
          steps: [
            ...setupSteps,
            { run: nix("pnpm automation:check-workflows") },
            { run: nix("pnpm automation:actionlint") },
            { run: nix("pnpm typecheck") },
            { run: nix("pnpm insight:test") },
            { run: nix("pnpm insight:check") },
            { run: nix("pnpm lint") },
          ],
        },
      },
    },
  },
  {
    filename: "repo-insight.yml",
    workflow: {
      name: "Repo Insight",
      on: {
        schedule: [{ cron: "17 * * * *" }],
        workflow_dispatch: {
          inputs: {
            force: {
              description: "Force one insight issue",
              required: false,
              default: "false",
            },
          },
        },
      },
      permissions: {
        contents: "write",
        issues: "write",
      },
      concurrency: {
        group: "repo-insight-producer",
        "cancel-in-progress": false,
      },
      jobs: {
        generate: {
          "runs-on": "ubuntu-latest",
          env: {
            CACHIX_AUTH_TOKEN: "${{ secrets.CACHIX_AUTH_TOKEN }}",
          },
          steps: [
            ...setupSteps,
            {
              uses: "actions/cache@v4",
              with: {
                path: ".cache/repo-insight",
                key: "repo-insight-capsules-${{ runner.os }}-${{ hashFiles('automation/repo-insight/**/*.ts', 'package.json', 'pnpm-lock.yaml', 'flake.lock') }}",
                "restore-keys": "repo-insight-capsules-${{ runner.os }}-",
              },
            },
            {
              name: "Generate insight",
              env: {
                GITHUB_TOKEN: "${{ github.token }}",
                GH_REPO_INSIGHT_TOKEN: "${{ secrets.GH_REPO_INSIGHT_TOKEN }}",
                CURSOR_API_KEY: "${{ secrets.CURSOR_API_KEY }}",
                CURSOR_MODEL: "${{ vars.CURSOR_MODEL }}",
                CURSOR_COMPACTION_MODEL: "${{ vars.CURSOR_COMPACTION_MODEL }}",
                REPO_INSIGHT_PRODUCER_DAILY_LIMIT: "4",
                REPO_INSIGHT_SELECTED_REPO_LIMIT: "3",
                REPO_INSIGHT_CANDIDATE_LIMIT: "25",
                REPO_INSIGHT_MAX_PACK_BYTES: "100000",
                REPO_INSIGHT_MAX_TOTAL_PACK_BYTES: "300000",
                REPO_INSIGHT_MAX_NEW_COMPACTIONS_PER_RUN: "2",
              },
              run: [
                "if [ \"${{ github.event.inputs.force }}\" = \"true\" ]; then",
                "  nix develop --command pnpm generate-insight:force --ci",
                "else",
                "  nix develop --command pnpm generate-insight --ci",
                "fi",
              ].join("\n"),
            },
            commitRepoInsightStateStep,
          ],
        },
      },
    },
  },
  {
    filename: "repo-insight-aggregate.yml",
    workflow: {
      name: "Repo Insight Aggregate",
      on: {
        schedule: [{ cron: "47 13 * * *" }],
        workflow_dispatch: {},
      },
      permissions: {
        contents: "write",
        issues: "write",
      },
      concurrency: {
        group: "repo-insight-aggregate",
        "cancel-in-progress": false,
      },
      jobs: {
        aggregate: {
          "runs-on": "ubuntu-latest",
          env: {
            CACHIX_AUTH_TOKEN: "${{ secrets.CACHIX_AUTH_TOKEN }}",
          },
          steps: [
            ...setupSteps,
            {
              name: "Aggregate insights",
              env: {
                GITHUB_TOKEN: "${{ github.token }}",
                CURSOR_API_KEY: "${{ secrets.CURSOR_API_KEY }}",
                CURSOR_MODEL: "${{ vars.CURSOR_MODEL }}",
                REPO_INSIGHT_AGGREGATOR_DAILY_LIMIT: "1",
                REPO_INSIGHT_AGGREGATOR_MAX_SEEDS: "30",
              },
              run: nix("pnpm aggregate-insights --ci"),
            },
            commitAggregatorBudgetStep,
          ],
        },
      },
    },
  },
];
