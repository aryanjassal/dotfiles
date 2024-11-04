{ ... }:

{
  programs.cava = {
    enable = true;
    settings = {
      output.channels = "mono";
      color.foreground = "magenta";
      smoothing.monstercat = 1;
      smoothing.noise_reduction = 33;
    };
  };
}
