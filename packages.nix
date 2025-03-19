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
    nodemon
    eslint_d
    cloudflared
    openssl
    prisma
    sqlite
    typescript
    gnumake

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
    glow
    yazi
    asciinema
    asciinema-agg
    termsvg
    imagemagick
    scrcpy
    samba
    inputs.chroma.packages.${system}.default

    # Apps
    thunderbird
    bitwarden
    teams-for-linux
    libreoffice
    postman
    pavucontrol
    obs-studio
    spotify
    brave
    vesktop
    gthumb
    mpv
    jetbrains.webstorm
    vscode
    kdePackages.konsole
    anki-bin

    # # Hyprland
    # swaylock-effects # TODO: switch to hyprlock
    # rofi-wayland
    # hyprlock
    # hypridle
    kitty
    # swww

    # Gnome
    gnome-tweaks
    gnomeExtensions.unite
    albert

    # System Tools
    wl-clip-persist
    qgnomeplatform
    brightnessctl
    wl-clipboard
    libnotify
    gradience
    playerctl
    kdePackages.breeze
    adwaita-qt
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
    material-symbols
    google-fonts
    # nerdfonts
    nerd-fonts.fira-code
    nerd-fonts.ubuntu
    nerd-fonts.hack
    nerd-fonts.caskaydia-cove
    nerd-fonts.jetbrains-mono
    nerd-fonts.space-mono
  ];
}
