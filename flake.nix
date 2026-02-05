{
  description = "Multi-platform dev shell with VSCode + Playwright browsers";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in
      {
        devShells.default = pkgs.mkShell {
          nativeBuildInputs = with pkgs; [
            nodejs
            playwright-driver.browsers
            chromium
          ];

          shellHook = ''
            export PLAYWRIGHT_BROWSERS_PATH=${pkgs.playwright-driver.browsers}
            export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true

            # Tell Puppeteer to use Nix Chromium
            export PUPPETEER_EXECUTABLE_PATH=${pkgs.chromium}/bin/chromium
            export PUPPETEER_SKIP_DOWNLOAD=true
          '';
        };
      }
    );
}
