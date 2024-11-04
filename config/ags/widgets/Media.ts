import type { MprisPlayer } from "types/service/mpris";
import Label from "types/widgets/label";

const mpris = await Service.import("mpris");
const players = mpris.bind("players");

const FALLBACK_ICON = "audio-x-generic-symbolic";
const PLAY_ICON = "media-playback-start-symbolic";
const PAUSE_ICON = "media-playback-pause-symbolic";
const PREV_ICON = "media-skip-backward-symbolic";
const NEXT_ICON = "media-skip-forward-symbolic";

let activePlayer: MprisPlayer | undefined = undefined;
let trackedPlayers: MprisPlayer[] = [];

/**
 * Takes in a time length or duration in seconds, and converts it to a mm:ss
 * format for displaying and rendering.
 * @param length Time in seconds
 * @returns String representation of the time
 */
// TODO: add hours.
function lengthToDuration(length: number): string {
  const min = Math.floor(length / 60);
  const sec = Math.floor(length % 60);
  const paddedSec = String(sec).padStart(2, "0");
  return `${min}:${paddedSec}`;
}

/**
 * Check if the current player is a real player which can play music.
 */
function isRealPlayer(player: MprisPlayer): boolean {
  // Sometimes the busnames
  if (!("busName" in player)) {
    console.warn("no bus name");
    return false;
  }
  return (
    player.busName != null &&
    typeof player.busName === "string" &&
    // playerctld just copies other buses and we don't need duplicates
    !player.busName.startsWith("org.mpris.MediaPlayer2.playerctld") &&
    // Non-instance mpd bus
    !player.busName.endsWith(".mpd") &&
    // Make sure we can actually play from the source
    player.can_play
  );
}

// Working as intended. I've checked it.
function filterPlayers(players: MprisPlayer[]) {
  return players.filter((p) => isRealPlayer(p));
}

function Player(player: MprisPlayer) {
  const img = Widget.Box({
    class_name: "img",
    vpack: "start",
    css: player.bind("cover_path").transform(
      (p) => `
            background-image: url('${p}');
        `,
    ),
  });

  const title = Widget.Scrollable({
    hscroll: "automatic",
    vscroll: "never",
    css: "min-width: 300px;",
    child: Widget.Label({
      class_name: "title",
      wrap: false,
      maxWidthChars: 24,
      hpack: "start",
      label: player.bind("track_title"),
    }),
  });

  const artist = Widget.Label({
    class_name: "artist",
    wrap: true,
    hpack: "start",
    label: player.bind("track_artists").transform((a) => a.join(", ")),
  });

  const positionSlider = Widget.Slider({
    class_name: "position",
    draw_value: false,
    on_change: ({ value }) => (player.position = value * player.length),
    visible: player.bind("length").as((l) => l > 0),
    setup: (self) => {
      function update() {
        const value = player.position / player.length;
        self.value = value > 0 ? value : 0;
      }
      self.hook(player, update);
      self.hook(player, update, "position");
      self.poll(1000, update);
    },
  });

  const positionLabel = Widget.Label({
    class_name: "position",
    hpack: "start",
    setup: (self) => {
      const update = (_: Label<any>) => {
        self.label = lengthToDuration(player.position);
        self.visible = player.length > 0;
      };

      self.hook(player, update, "position");
      self.poll(1000, update);
    },
  });

  const lengthLabel = Widget.Label({
    class_name: "length",
    hpack: "end",
    visible: player.bind("length").transform((l) => l > 0),
    label: player.bind("length").transform(lengthToDuration),
  });

  const icon = Widget.Icon({
    class_name: "icon",
    hexpand: true,
    hpack: "end",
    vpack: "start",
    tooltip_text: player.identity || "",
    icon: player.bind("entry").transform((entry) => {
      const name = `${entry}-symbolic`;
      return Utils.lookUpIcon(name) ? name : FALLBACK_ICON;
    }),
  });

  const playPause = Widget.Button({
    // class_name: "play-pause",
    on_clicked: () => {
      player.playPause();
      activePlayer = player;
    },
    visible: player.bind("can_play"),
    child: Widget.Icon({
      icon: player.bind("play_back_status").transform((s) => {
        switch (s) {
          case "Playing":
            return PAUSE_ICON;
          case "Paused":
          case "Stopped":
            return PLAY_ICON;
        }
      }),
    }),
  });

  const temp = Widget.CircularProgress({
    css:
      "min-width: 20px;" +
      "min-height: 20px;" +
      "font-size: 2px;" +
      "color: skyblue;",
    value: player.length ? player.position / player.length : 0,
    startAt: 0.75,
    setup: (self) => {
      const update = (_) => {
        self.value = player.length ? player.position / player.length : 0;
      };
      self.hook(player, update, "position");
      self.poll(1000, update);
    },
  });

  const layered = Widget.Overlay({
    child: playPause,
    overlays: [temp],
    pass_through: true,
  });

  const prev = Widget.Button({
    on_clicked: () => {
      player.previous();
      activePlayer = player;
    },
    visible: player.bind("can_go_prev"),
    child: Widget.Icon(PREV_ICON),
  });

  const next = Widget.Button({
    on_clicked: () => {
      player.next();
      activePlayer = player;
    },
    visible: player.bind("can_go_next"),
    child: Widget.Icon(NEXT_ICON),
  });

  return Widget.Box(
    { class_name: "player" },
    img,
    Widget.Box(
      {
        vertical: true,
        hexpand: true,
      },
      Widget.Box([title, icon]),
      artist,
      Widget.Box({ vexpand: true }),
      positionSlider,
      Widget.CenterBox({
        start_widget: positionLabel,
        center_widget: Widget.Box([prev, layered, next]),
        end_widget: lengthLabel,
      }),
    ),
  );
}

function generateMediaPopup() {
  return Widget.Window({
    class_name: "media-popup",
    visible: false,
    anchor: ["top"],
    child: Widget.Box({
      vertical: true,
      spacing: 8,
      css: "padding: 10px; min-width: 300px; border-radius: 8px; background-color: @window-bg-color;",
      children: players.as((p) => {
        let filtered = filterPlayers(p);
        filtered = filtered.sort((v) => (v == activePlayer ? 0 : 1));
        return filtered.map((v) => Player(v));
      }),
    }),
  });
}

let mediaPopup = generateMediaPopup();

const mediaButton = Widget.Button({
  class_name: "media-button",
  child: Widget.Label({
    truncate: "end",
    maxWidthChars: 32,
    label: "Media",
  }).hook(
    mpris,
    (self) => {
      const trackedBusNames = filterPlayers(trackedPlayers).map(
        (v) => v.bus_name,
      );
      const mprisBusNames = filterPlayers(mpris.players).map((v) => v.bus_name);
      if (JSON.stringify(trackedBusNames) != JSON.stringify(mprisBusNames)) {
        trackedPlayers = JSON.parse(
          JSON.stringify(filterPlayers(mpris.players)),
        );
        mediaPopup.destroy();
        mediaPopup = generateMediaPopup();
      }

      if (mpris.players.length > 0) {
        let { track_artists, track_title } =
          activePlayer ?? filterPlayers(mpris.players)[0];
        const artists = track_artists.length
          ? track_artists.join(", ")
          : "Artist";
        track_title = track_title.length ? track_title : "Title";
        self.label = `${artists} - ${track_title}`;
      } else {
        self.label = "Nothing is playing";
      }
    },
    "player-changed",
  ),
  on_clicked: () => {
    mediaPopup.visible = !mediaPopup.visible;
  },
});

export default function MediaControls() {
  return Widget.Box({
    class_name: "media",
    children: [mediaButton],
  });
}
