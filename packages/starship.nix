{ ... }:

{
  programs.starship = {
    enable = true;
    settings = {
      format = ''
        $directory$git_branch$git_commit$git_state$git_status$nix_shell$jobs
        $character
      '';

      character = {
        success_symbol = "[->](bold)";
        error_symbol = "[->](bold red)";
      };

      git_status = {
        style = "orange";
        format = "( • [$all_status$ahead_behind]($style))";
        conflicted = " ";
        diverged = " ";
        stashed = " ";
        ahead = " ";
        behind = " ";
        renamed = " ";
        untracked = " ";
        deleted = " ";
        staged = " ";
        modified = " ";
      };

      git_branch = {
        style = "red";
        symbol = " ";
        format = "( • [$symbol$branch(:$remote_branch)]($style))";
      };

      git_commit = {
        commit_hash_length = 6;
        tag_symbol = " ";
      };

      nix_shell = { format = "( • [$name](blue))"; };

      directory = {
        home_symbol = "home";
        read_only = "  ";
        style = "purple";
        format = "[$path]($style)";
      };

      jobs = {
        format = "( • [fg: ]($style)[$number](bold orange))";
        number_threshold = 1;
        style = "orange";
      };

      package.disable = true;
      time.disabled = true;
      palette = "tokyonight";

      palettes = { tokyonight = { orange = "#ff9e64"; }; };
    };
  };
}
