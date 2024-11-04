{ inputs, system, pkgs, cursor, icons, font, theme }:

{
  # Automatically import all .nix files from ./packages directory
  imports = let
    matches = builtins.filter (file: builtins.match ".+\\.nix$" file != null)
      (builtins.attrNames (builtins.readDir ./packages));
    paths = map (name: "${./packages}/${name}") matches;
  in map (file: import file { inherit pkgs cursor icons font theme; }) paths;


  home.packages = with pkgs; [
    # Development
    python3
    neovim
    neovide
    git-lfs
    sass
    gcc
    vscode
    libclang
    deno
    bun

    # Nvim stuff
    stylua
    nixfmt-classic
    emmet-language-server
    typescript-language-server
    vscode-langservers-extracted
    nodePackages.prettier
    lua-language-server
    emacsPackages.deno-fmt
    nil
    biome

    # CLI Tools
    wget
    peaclock
    pfetch
    nodejs
    cava
    glow
    yazi
    asciinema
    asciinema-agg
    termsvg
    imagemagick
    scrcpy
    inputs.chroma.packages.${system}.default

    # Apps
    teams-for-linux
    libreoffice
    pavucontrol
    obs-studio
    spotify
    brave
    vesktop
    gthumb
    mpv
    foot
    jetbrains.webstorm

    # Hyprland
    swaylock-effects # TODO: switch to hyprlock
    rofi-wayland
    hyprlock
    hypridle
    kitty
    swww

    # System Tools
    xdg-desktop-portal-hyprland
    wl-clip-persist
    brightnessctl
    wl-clipboard
    libnotify
    gradience
    playerctl
    adw-gtk3
    starship
    ripgrep
    ffmpeg
    unzip
    zip
    fwupd
    socat
    slurp
    grim
    btop
    gtk3
    eza
    zsh
    bat
    fzf

    # Fonts
    nerdfonts
  ];
}
