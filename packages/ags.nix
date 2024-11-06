{ pkgs, theme, ... }:

{
  programs.ags = {
    enable = true;
    configDir = theme.configDir;
    extraPackages = with pkgs; [ gtksourceview webkitgtk accountsservice ];
  };
}
