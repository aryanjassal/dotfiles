{ pkgs, theme, ... }:

{
  programs.ags = {
    enable = true;
    configDir = "${theme.configDir}/ags";
    extraPackages = with pkgs; [ gtksourceview webkitgtk accountsservice ];
  };
}
