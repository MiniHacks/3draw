{
  inputs = {
    nixpkgs.url = "nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem(system: let
      pkgs = nixpkgs.legacyPackages.${system};
      lib = nixpkgs.lib;
    in {
      devShell = pkgs.mkShell {
        buildInputs = (with pkgs;
          # nix tooling
          [ yarn2nix ] ++
          # editor configuration
          (with nodePackages;
            [ vscode-css-languageserver-bin vscode-html-languageserver-bin ]) ++
          # packagesActual
          [ cloudflared yarn ]);
      };
    });
}
