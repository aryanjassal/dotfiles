{ pkgs, ... }:

{
  brave = pkgs.brave.overrideAttrs (oldAttrs: {
    postInstall = ''
      substituteInPlace $out/share/applications/brave-browser.desktop \
        --replace "Brave Web Browser" "Brave"
    '';
  });
}
