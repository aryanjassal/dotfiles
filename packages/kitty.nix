{ font, ... }:

{
  programs.kitty = {
    enable = true;
    settings = {
      include = "./theme.conf";
      font_family = font.name;
      cursor = "none";

      scrollback_lines = 10000;
      enable_audio_bell = false;
      update_check_interval = 0;
      window_padding_width = "4 8";
      background_opacity = "0.8";
    };
  };
}
