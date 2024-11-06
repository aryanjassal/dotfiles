{ ... }:

{
  programs.btop = {
    enable = true;
    settings = {
      theme_background = false;
      vim_keys = true;
      color_theme = "tokyo-night";
      update_ms = 100;
    };
  };
}
