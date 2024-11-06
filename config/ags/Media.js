const mpris = await Service.import("mpris");
const players = mpris.bind("players");

const FALLBACK_ICON = "audio-x-generic-symbolic";
const PLAY_ICON = "media-playback-start-symbolic";
const PAUSE_ICON = "media-playback-pause-symbolic";
const PREV_ICON = "media-skip-backward-symbolic";
const NEXT_ICON = "media-skip-forward-symbolic";

/** @param {number} length */
function lengthStr(length) {
  const min = Math.floor(length / 60);
  const sec = Math.floor(length % 60);
  const sec0 = sec < 10 ? "0" : "";
  return `${min}:${sec0}${sec}`;
}

function isRealPlayer(player) {
  return (
    // playerctld just copies other buses and we don't need duplicates
    !player.busName.startsWith("org.mpris.MediaPlayer2.playerctld") &&
    // Non-instance mpd bus
    !player.busName.endsWith(".mpd") &&
    // Make sure entry is valid
    player.entry != null
  );
}

/** @param {import('types/service/mpris').MprisPlayer} player */
function Player(player) {
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
    })
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
      const update = (_, time) => {
        self.label = lengthStr(time || player.position);
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
    label: player.bind("length").transform(lengthStr),
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
    class_name: "play-pause",
    on_clicked: () => player.playPause(),
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

  const prev = Widget.Button({
    on_clicked: () => player.previous(),
    visible: player.bind("can_go_prev"),
    child: Widget.Icon(PREV_ICON),
  });

  const next = Widget.Button({
    on_clicked: () => player.next(),
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
        center_widget: Widget.Box([prev, playPause, next]),
        end_widget: lengthLabel,
      }),
    ),
  );
}

const mediaPopup = Widget.Window({
  class_name: "media-popup",
  visible: false,
  anchor: ["top"],
  child: Widget.Box({
    vertical: true,
    spacing: 8,
    css: "padding: 10px; min-width: 300px; border-radius: 8px; background-color: @window-bg-color;",
    children: players.as((p) =>
      // p.map((player) => (isRealPlayer(player) ? Player(player) : null)),
      p.map((player) => (Player(player))),
    ),
  }),
});

const mediaButton = Widget.Button({
  class_name: "media-button",
  child: Widget.Label({
    truncate: "end",
    maxWidthChars: 32,
    label: "Media",
  }).hook(
    mpris,
    (self) => {
      if (mpris.players.length > 0) {
        const { track_artists, track_title } = mpris.players[0];
        self.label = `${track_artists.join(", ")} - ${track_title}`;
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
    orientation: "vertical",
    children: [mediaButton],
  });
}
