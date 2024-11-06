{ ... }:

{
  programs.cava = {
    enable = true;
    settings = {
      smoothing.noise_reduction = 33;
      output.channels = "mono";
      color.foreground = "red";
    };
  };
}
