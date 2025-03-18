{ cursor, ... }:

let
  hyprsettings = {
    gaps = {
      inside = "6";
      outside = "6";
    };
    rounding = "12";
  };
in {
  wayland.windowManager.hyprland = {
    enable = true;
    systemd.enable = true;
    xwayland.enable = true;

    settings = {
      exec-once =
        [ "swww-daemon" "/home/aryanj/.bin/battery --notify" ];

      exec = [
        "swww img /home/aryanj/.system/wallpaper"
        "hyprctl setcursor '${cursor.name}' ${toString cursor.size}"
        "ags -c ~/.config/home-manager/config/ags/config.js"
      ];

      monitor = [
        "eDP-1,preferred,0x1080,1"

        # My workstation
        "desc:Samsung Electric Company LC27G5xT H4ZRC00505,preferred,-320x-360,1"
        "desc:Microstep MSI MP273A PB4H643C00373,preferred,2240x-720,1,transform,3"

        # Desk 1
        "desc:Dell Inc. DELL U2419H D6XWLS2,preferred,0x0,1"

        # Desk 2
        "desc:Dell Inc. DELL U2419H 397VPS2,preferred,0x0,1,"

        # Brian's workstation
        "desc:Dell Inc. DELL U2417H Y5V6Y81F836L,preferred,0x0,1"
        "desc:Dell Inc. DELL U2417H Y5V6Y85EA32L,preferred,1920x-540,1,transform,1"
      ];

      windowrulev2 = [
        "float, title:^(btop)$"
        "float, class:^(qemu|QEMU)$"
        "float, class:^(xdg-desktop-portal-gtk)$"
        "center, title:^(btop)$"
        "size 70% 70%, title:^(btop)$"
      ];

      layerrule = [
        "blur, rofi"
      ];

      input = {
        follow_mouse = 1;
        touchpad = {
          natural_scroll = true;
          disable_while_typing = true;
        };
        repeat_rate = 35;
        repeat_delay = 200;
        kb_options = "caps:backspace";
      };

      general = {
        gaps_in = hyprsettings.gaps.inside;
        gaps_out = hyprsettings.gaps.outside;
        border_size = 0;
        layout = "dwindle";
        allow_tearing = false;
      };

      decoration = {
        rounding = hyprsettings.rounding;
        blur = {
          enabled = true;
          size = 10;
          passes = 3;
        };
      };

      animations = {
        enabled = true;
        bezier = [
          "ws, 0.2, 0.9, 0.1, 1.05"
          "ease, 0.25, 0.1, 0.25, 1"
        ];
        animation = [
          "windows, 1, 3, ws"
          "windowsOut, 1, 2, default, popin 80%"
          "border, 1, 10, default"
          "borderangle, 1, 8, default"
          "fade, 1, 1, default"
          "workspaces, 1, 6, ws"
          "layersIn, 1, 2, ease, slide up"
          "layersOut, 1, 3, ease, slide down"
        ];
      };

      dwindle = {
        pseudotile = true;
        preserve_split = true;
        force_split = 2;
      };

      gestures = {
        workspace_swipe = true;
        workspace_swipe_cancel_ratio = 0;
      };

      misc = {
        force_default_wallpaper = 0;
        animate_manual_resizes = true;
      };

      "$mod" = "SUPER";
      "$alt" = "ALT";
      "$term" = "kitty";
      "$menu" = "rofi -show drun";
      "$lock" = "~/.bin/screenlock";
      "$snip" = "~/.bin/snip";
      "$suspend" = "~/.bin/screensuspend";
      "$hyprmanager" = "~/.bin/hyprmanager";

      bind = [
        "$mod, RETURN, exec, $term"
        "$mod, Q, killactive,"
        "$mod + SHIFT, F, toggleFloating,"
        "$mod, P, pseudo,"
        "$mod, S, pin,"
        "$mod, R, togglesplit,"
        "$mod, F, fullscreen, 0"
        "$alt, F, fullscreen, 1"
        "$mod + CTRL + SHIFT, Q, exit"
        "$alt, SPACE, exec, $menu"
        "$alt, L, exec, $lock"
        "$alt + SHIFT, L, exec, $suspend"

        ", PRINT, exec, $snip"

        "$mod, mouse_down, workspace, e+1"
        "$mod, mouse_up, workspace, e-1"

        "$mod + SHIFT, I, exec, playerctl previous"
        "$mod + SHIFT, O, exec, playerctl play-pause"
        "$mod + SHIFT, P, exec, playerctl next"

        "$mod + alt, Q, exec, brightnessctl s 5%-"
        "$mod + SHIFT, W, exec, brightnessctl s 5%+"

        "$mod + SHIFT, U, exec, wpctl set-mute @DEFAULT_SINK@ toggle"
        "$mod + SHIFT, Y, exec, wpctl set-mute @DEFAULT_SOURCE@ toggle"

        ", XF86AudioPrev, exec, playerctl previous"
        ", XF86AudioPlay, exec, playerctl play-pause"
        ", XF86AudioNext, exec, playerctl next"

        ", XF86MonBrightnessDown, exec, brightnessctl s 5%-"
        ", XF86MonBrightnessUp, exec, brightnessctl s 5%+"

        ", jXF86AudioMute, exec, wpctl set-mute @DEFAULT_SINK@ toggle"
        ", XF86AudioMicMute, exec, wpctl set-mute @DEFAULT_SOURCE@ toggle"
      ] ++ (builtins.concatLists (builtins.genList (x:
        let ws = let c = (x + 1) / 10; in builtins.toString (x + 1 - (c * 10));
        in [
          "$mod, ${ws}, workspace, ${toString (x + 1)}"
          "$mod SHIFT, ${ws}, movetoworkspace, ${toString (x + 1)}"
        ]) 10));

      binde = [
        "$mod, h, movefocus, l"
        "$mod, j, movefocus, d"
        "$mod, k, movefocus, u"
        "$mod, l, movefocus, r"

        "$mod + CTRL, h, resizeactive, -25 0"
        "$mod + CTRL, j, resizeactive, 0 25"
        "$mod + CTRL, k, resizeactive, 0 -25"
        "$mod + CTRL, l, resizeactive, 25 0"

        "$mod + SHIFT, h, movewindow, l"
        "$mod + SHIFT, j, movewindow, d"
        "$mod + SHIFT, k, movewindow, u"
        "$mod + SHIFT, l, movewindow, r"

        "$mod + SHIFT, up, movecurrentworkspacetomonitor, u"
        "$mod + SHIFT, down, movecurrentworkspacetomonitor, d"
        "$mod + SHIFT, left, movecurrentworkspacetomonitor, l"
        "$mod + SHIFT, right, movecurrentworkspacetomonitor, r"

        "$alt + SHIFT, J, exec, wpctl set-volume --limit 2.0 @DEFAULT_SINK@ 2%-"
        "$alt + SHIFT, K, exec, wpctl set-volume --limit 2.0 @DEFAULT_SINK@ 2%+"

        ", XF86AudioLowerVolume, exec, wpctl set-volume --limit 2.0 @DEFAULT_SINK@ 2%-"
        ", XF86AudioRaiseVolume, exec, wpctl set-volume --limit 2.0 @DEFAULT_SINK@ 2%+"
      ];

      bindm = [ "$mod, mouse:272, movewindow" "$mod, mouse:273, resizewindow" ];

      bindl = [
        "$mod + SHIFT, N, exec, $hyprmanager --display 'eDP-1' enable 'preferred,0x1080,1'"
        "$mod + SHIFT, M, exec, $hyprmanager --display 'eDP-1' disable"
        "$mod + SHIFT, A, exec, $hyprmanager --gaps ${hyprsettings.gaps.inside} ${hyprsettings.gaps.outside} ${hyprsettings.rounding}"
        "$mod + SHIFT, S, exec, $hyprmanager --gaps 0 0 0"
      ];
    };
  };
}
