{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/a58bc8ad779655e790115244571758e8de055e3d";
    home-manager = {
      url = "github:nix-community/home-manager";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    ags = {
      url = "github:aylur/ags/344ea72cd3b8d4911f362fec34bce7d8fb37028c";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    polykey-cli.url = "github:matrixai/polykey-cli";
    chroma.url = "github:aryanjassal/chroma";
  };

  outputs = { nixpkgs, home-manager, ... }@inputs:
    let system = "x86_64-linux";
    in {
      homeConfigurations."aryanj" = home-manager.lib.homeManagerConfiguration {
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };
        extraSpecialArgs = { inherit system inputs; };
        modules = [ ./home.nix ];
      };
    };
}
