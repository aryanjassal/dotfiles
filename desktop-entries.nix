{ ... }:

{
  xdg.desktopEntries = {
    btop = {
      name = "btop";
      genericName = "System Monitor";
      comment = "A powerful yet minimalistic TUI resource monitor";
      icon = "org.gnome.Console";
      exec = "kitty --title btop btop";
      terminal = false;
      categories = [ "System" "Monitor" "ConsoleOnly" ];
      settings = { Keywords = "system;process;task;monitor;btop"; };
    };
    nvim = {
      name = "Neovim";
      genericName = "Text Editor";
      comment = "The one and only";
      icon = "nvim";
      exec = "nvim";
      categories = [ "Utility" "TextEditor" ];
      mimeType = [ "text/english" "text/plain" "application/x-shellscript" ];
    };
    brave-browser = {
      name = "Brave";
      genericName = "Web Browser";
      comment = "#adfreeforlife";
      icon = "brave-browser";
      exec =
        "brave --enable-features=TouchpadOverscrollHistoryNavigation,UseOzonePlatform --ozone-platform=wayland --enable-wayland-ime %U";
      terminal = false;
      categories = [ "Network" "WebBrowser" ];
      mimeType = [
        "application/pdf"
        "application/rdf+xml"
        "application/rss+xml"
        "application/xhtml+xml"
        "application/xhtml_xml"
        "application/xml"
        "image/gif"
        "image/jpeg"
        "image/png"
        "image/webp"
        "text/html"
        "text/xml"
        "x-scheme-handler/http"
        "x-scheme-handler/https"
      ];
      actions = {
        "new-window" = {
          name = "New Window";
          exec = "brave";
        };
        "new-private-window" = {
          name = "New Private Window";
          exec = "brave --incognito";
        };
      };
    };
    vesktop = {
      name = "Vesktop";
      genericName = "Internet Messenger";
      comment = "Almost there but not quite";
      icon = "Vesktop";
      exec = "vesktop --wayland-text-input-version=3 --enable-wayland-ime %U";
      settings = { 
        Keywords = "discord;vencord;electron;chat";
        StartupWMClass = "Vesktop";
        Version = "1.4";
      };
    };
  };
}
