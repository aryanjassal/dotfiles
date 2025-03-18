{
  inputs = {
    # nixpkgs.url = "github:nixos/nixpkgs/a58bc8ad779655e790115244571758e8de055e3d";
    nixpkgs.url = "github:nixos/nixpkgs/2c15aa59df0017ca140d9ba302412298ab4bf22a";
    home-manager = {
      # url = "github:nix-community/home-manager/64c6325b28ebd708653dd41d88f306023f296184";
      url = "github:nix-community/home-manager/1cd17a2f76f7711b06d5d59f1746cef602974498";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    ags = {
      # url = "github:aylur/ags/344ea72cd3b8d4911f362fec34bce7d8fb37028c";
      url = "github:aylur/ags/81159966eb8b39b66c3efc133982fd76920c9605";
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
