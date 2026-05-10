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

const nixBash = (commands: string[]) => `nix develop --command bash -lc '${commands.join("\n").replace(/'/g, "'\\''")}'`;

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
            { run: nix("pnpm insight:validate") },
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
        repository_dispatch: {
          types: ["repo-insight"],
        },
        workflow_dispatch: {
          inputs: {
            force: {
              description: "Force one insight artifact and issue",
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
        group: "repo-insight-${{ github.run_id }}",
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
                REPO_INSIGHT_PAYLOAD: "${{ github.event_name == 'repository_dispatch' && toJson(github.event.client_payload) || '' }}",
              },
              run: [
                "if [ \"${{ github.event.inputs.force }}\" = \"true\" ]; then",
                "  nix develop --command pnpm generate-insight:force --ci",
                "else",
                "  nix develop --command pnpm generate-insight --ci",
                "fi",
              ].join("\n"),
            },
            {
              name: "Commit generated artifacts if any",
              run: nixBash([
                "git config user.name github-actions[bot]",
                "git config user.email github-actions[bot]@users.noreply.github.com",
                "git add data/taste-profile.md content/insights",
                "git diff --cached --quiet || git commit -m \"Generate repo insight artifacts\"",
                "git push",
              ]),
            },
          ],
        },
      },
    },
  },
];
