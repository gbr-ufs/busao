# SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
#
# SPDX-License-Identifier: GPL-3.0-or-later

# TODO: Install syntaqlite: https://github.com/NixOS/nixpkgs/pull/507147

{
  description = "Bus Vacancy Management System.";
  inputs.nixpkgs.url = "github:nixos/nixpkgs/master";
  outputs =
    { nixpkgs, ... }:
    let
      inherit (nixpkgs) lib;
      forAllSystems = lib.genAttrs lib.systems.flakeExposed;
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          emacsSettings = pkgs.writeText "dir-locals.el" ''
            ((html-ts-mode .       ((apheleia-formatter . (biome))
                                    (eglot-server-programs . ((html-ts-mode . ("rass" "--" "vscode-html-language-server" "--stdio" "--" "htmx-lsp"))))))
             (typescript-ts-mode . ((apheleia-formatter . (biome))
                                    (eglot-server-programs . ((typescript-ts-mode . ("tsc" "--lsp" "--stdio")))))))
          '';
          VSCodeSettings = pkgs.writeText "vscode-settings.json" ''
            {
                "editor.codeActionsOnSave": {
                  "source.organizeImports.biome": "explicit"
                },
                "editor.defaultFormatter": "biomejs.biome",
                "editor.formatOnSave": true,
                ""
              }
          '';
          zedSettings = pkgs.writeText "zed-settings.json" ''
            {
                "format_on_save": "on",
                "languages": {
                  "HTML": {
                    "language_servers": [ "html-language-server", "htmx-lsp" ]
                  },
                  "TypeScript": {
                    "formatter": "language_server",
                    "language_servers": [ "tsc", "biome" ]
                  }
                }
              }
          '';
        in
        {
          default = pkgs.mkShell {
            packages = with pkgs; [
              bun
              goreleaser
              htmx-lsp
              nixd
              rassumfrassum
              reuse
              sqlite
              vscode-langservers-extracted
            ];
            shellHook = ''
              mkdir -p .vscode
              mkdir -p .zed
              ln -sf ${emacsSettings} .dir-locals.el
              ln -sf ${VSCodeSettings} .vscode/settings.json
              ln -sf ${zedSettings} .zed/settings.json
            '';
          };
        }
      );
      formatter = forAllSystems (system: nixpkgs.legacyPackages.${system}.nixfmt);
    };
}
