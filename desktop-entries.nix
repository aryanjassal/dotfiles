{ ... }:

{
  xdg.desktopEntries = {
    btop = {
      name = "btop";
      genericName = "System Monitor";
      comment = "A powerful yet minimalistic TUI resource monitor";
      icon = "org.gnome.Console";
      exec = "btop";
      terminal = true;
      categories = [ "System" "Monitor" "ConsoleOnly" ];
      settings = { Keywords = "system;process;task;monitor"; };
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
  };
}
