{
  description = "Dev shell: Bun + Node + Chromium (MDX mermaid). Playwright browser bundles are not in the flake closure — use `nix shell nixpkgs#playwright-driver.browsers` when running e2e (keeps `nix flake check` fast).";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    git-hooks.url = "github:cachix/git-hooks.nix";
    git-hooks.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      git-hooks,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };

        preCommitCheck = git-hooks.lib.${system}.run {
          src = ./.;
          hooks = {
            actionlint.enable = true;
            check-yaml.enable = true;
            trim-trailing-whitespace.enable = true;
            end-of-file-fixer.enable = true;

            # Same as `nx run workspace:typecheck` but skips Nx CLI startup (faster commits).
            nx-typecheck = {
              enable = true;
              name = "workspace typecheck (tsc)";
              entry = "${pkgs.lib.getExe pkgs.bun} x tsc --noEmit -p tsconfig.json";
              pass_filenames = false;
              # bun on PATH; project deps come from ./node_modules (not bundled in Nix).
              extraPackages = [ pkgs.bun ];
            };
            nx-lint = {
              enable = true;
              name = "nx workspace lint";
              entry = "${pkgs.lib.getExe pkgs.bun} x nx run workspace:lint";
              pass_filenames = false;
              extraPackages = [ pkgs.bun ];
              after = [ "nx-typecheck" ];
            };
          };
        };
      in
      {
        # Intentionally no `checks.pre-commit-check` here: `nix flake check` sandbox has no
        # node_modules, so Nx/Bun hooks cannot run there. Local `git commit` uses the dev
        # shell hook; CI should keep running `nx run workspace:*` in GitHub Actions.

        # Single dev shell: keep `playwright-driver.browsers` out so `nix flake check` does not
        # pull a second Chromium bundle (flake check validates every devShell output). For e2e,
        # compose with `nix shell nixpkgs#playwright-driver.browsers --command nix develop` (see README).
        devShells.default = pkgs.mkShell {
          nativeBuildInputs =
            (with pkgs; [
              bun
              nodejs
              git
              gh
              ripgrep
              jq
              curl
              actionlint
              repomix
              chromium
            ])
            ++ preCommitCheck.enabledPackages;

          shellHook =
            preCommitCheck.shellHook
            + ''
              export PUPPETEER_EXECUTABLE_PATH=${pkgs.chromium}/bin/chromium
              export PUPPETEER_SKIP_DOWNLOAD=true
            '';
        };
      }
    );
}
