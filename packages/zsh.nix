{ ... }:

{
  programs.zsh = {
    enable = true;
    autosuggestion.enable = true;
    syntaxHighlighting.enable = true;

    initExtraFirst = ''
      zstyle ':completion:*' matcher-list 'm:{a-zA-Z}={A-Za-z}'
    '';

    history = {
      expireDuplicatesFirst = true;
      ignorePatterns = [ "true" "false" ];
      size = 8192;
      path = "$HOME/.zhistory";
    };

    initExtra = ''
      setopt NO_BEEP
      EDITOR=nvim
      VISUAL=neovide
      PATH=$PATH:~/.cargo/bin:~/.bin:~/.npm-globals/node_modules/.bin
    '';

    shellAliases = {
      sudo = "sudo -E";
      ls = "eza -lh --icons --sort=type";
      lsa = "ls -a";
      tree = "eza --tree --icons --level 3";
      m = "make";
      mc = "make clean";
      ndev = "nix develop --command zsh";
      rebuild = "home-manager switch --flake ~/.config/home-manager";
      record = "ZDOTDIR=~/.zsh-rec zsh";
      ed = "$EDITOR";
      edit = "$VISUAL &";
    };
  };
}
