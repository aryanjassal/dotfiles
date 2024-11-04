{ pkgs, system, inputs, ... }:

let
  theme = { configDir = ./config; };

  # Cursor theme
  cursor = {
    name = "BreezeLight";
    size = 24;
    package = plasma6Cursors;
  };

  # Icon themes
  icons = {
    name = "Papirus";
    size = "32x32";
    package = pkgs.papirus-icon-theme;
  };

  # Font
  font = {
    name = "JetBrainsMono Nerd Font";
    size = "12";
  };

  # Custom package for KDE Plasma 6 Cursor theme
  plasma6Cursors = pkgs.stdenv.mkDerivation {
    name = "plasma6-cursors";
    src = pkgs.fetchFromGitHub {
      owner = "KDE";
      repo = "breeze";
      rev = "7ad6f073a8643c746b01989e8205cfe7f022f97c";
      sha256 = "sha256-VzFExySubX55l2D2PQcL5u21vv3hnAO3IBoj2mLERl4=";
    };
    installPhase = ''
      mkdir -p $out/share/icons
      cp -r $src/cursors/Breeze_Light/Breeze_Light $out/share/icons/BreezeLight
      cp -r $src/cursors/Breeze/Breeze $out/share/icons/BreezeDark
    '';
  };
in rec {
  imports = let
    paths = [ ./packages.nix ./desktop-entries.nix ];
    modules = [
      inputs.ags.homeManagerModules.default
      inputs.polykey-cli.homeModules.default
    ];
  in modules ++ map
  (configPath: import configPath { inherit inputs system pkgs cursor icons font theme; })
  paths;

  home = {
    # Home configuration
    username = "aryanj";
    homeDirectory = "/home/aryanj";
    stateVersion = "24.11";

    # Make sure Wayland is being used by default
    sessionVariables = {
      NIXOS_OZONE_WL = "1";
      XCURSOR_THEME = cursor.name;
      XCURSOR_SIZE = cursor.size;
    };

    # Cursor theming
    pointerCursor = cursor // { gtk.enable = true; };

  };

  xdg.systemDirs.data = [ "${home.homeDirectory}/.local/share" ];

  # GTK stuff.
  # For theming GTK apps, look into Chroma
  gtk = {
    enable = true;
    cursorTheme = cursor;
    theme.name = "adw-gtk3-dark"; # Needed by Brave for some reason
  };

  systemd.user.sessionVariables = home.sessionVariables;

  # Background services to run
  services = {
    ssh-agent.enable = true;
    kdeconnect.enable = true;
  };

  # Automatically update fonts if a font package is installed
  fonts.fontconfig.enable = true;

  # Nix-specific settings
  nix = {
    package = pkgs.nix;
    settings = {
      experimental-features = [ "nix-command" "flakes" ];
      warn-dirty = false;
      auto-optimise-store = true;
    };
  };
}
