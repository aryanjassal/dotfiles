import type { MprisPlayer } from 'types/service/mpris';
import { compareArrays } from 'utils';

const mpris = await Service.import('mpris');

let activePlayer: MprisPlayer = getActivePlayer(mpris.players);
let trackedBusNames: string[] = [];

function getActivePlayer(players: MprisPlayer[]) {
  if (players.length === 1) return players[0];
  players = players.filter((v) => v.play_back_status === 'Playing');
  if (players.length === 1) return players[0];
  players = players.filter((v) => v.metadata['mpris:artUrl'] == null);
  return players[0];
}

/**
 * Takes in a time length or duration in seconds, and converts it to a mm:ss
 * format for displaying and rendering.
 * @param length Time in seconds
 * @returns String representation of the time
 */
// TODO: add hours
function lengthToDuration(length: number): string {
  if (length < 0) return '??';
  const min = Math.floor(length / 60);
  const sec = Math.floor(length % 60);
  const paddedSec = String(sec).padStart(2, '0');
  return `${min}:${paddedSec}`;
}

/**
 * Check if the current player is a real player which can play music.
 */
function isRealPlayer(player: MprisPlayer): boolean {
  return (
    // playerctld just copies other buses and we don't need duplicates
    !player.bus_name.startsWith('org.mpris.MediaPlayer2.playerctld') &&
    // Non-instance mpd bus
    !player.bus_name.endsWith('.mpd') &&
    // Make sure we can actually play from the source
    player.can_play
  );
}

/**
 * Takes in a list of MprisPlayers and filters out all invalid players.
 * @param players All MprisPlayers
 * @returns Filtered for real players
 */
function filterPlayers(players: MprisPlayer[]) {
  return players.filter((p) => isRealPlayer(p));
}

// TODO: convert this to a class for maximum control and flexibility
function Player(player: MprisPlayer, isPinned = false) {
  const thumbnail = Widget.Box({
    class_name: 'img',
    vpack: 'start',
    css: player.bind('metadata').transform((meta) => {
      const imageUrl =
        meta['mpris:artUrl'] || `${App.configDir}/assets/disc.png`;
      return `background-image: url('${imageUrl}');`;
    }),
  });

  const title = Widget.Scrollable({
    hscroll: 'external',
    vscroll: 'never',
    css: 'min-width: 300px;',
    child: Widget.Label({
      class_name: 'title',
      wrap: false,
      maxWidthChars: 24,
      hpack: 'start',
      label: player.bind('track_title'),
    }),
  });

  const artist = Widget.Label({
    class_name: 'artist',
    wrap: true,
    hpack: 'start',
    label: player.bind('track_artists').transform((a) => a.join(', ')),
  });

  const playPause = Widget.Box(
    {
      class_name: 'play-container',
    },
    Widget.Button({
      class_name: 'media-button',
      on_clicked: () => {
        player.playPause();
        activePlayer = player;
      },
      visible: player.bind('can_play'),
      child: Widget.Label({
        class_name: 'material-icons',
        label: player.bind('play_back_status').transform((status) => {
          switch (status) {
            case 'Playing':
              return 'pause';
            case 'Paused':
            case 'Stopped':
              return 'play_arrow';
          }
        }),
      }),
    }),
  );

  const progressbar = Widget.CircularProgress({
    class_name: 'progressbar',
    value: player.length ? player.position / player.length : 0,
    startAt: 0.75,
    setup: (self) => {
      const update = (_: any) => {
        self.value = player.length ? player.position / player.length : 0;
      };
      self.hook(player, update, 'position');
      self.poll(1000, update);
    },
  });

  const playProgress = Widget.Overlay({
    class_name: 'media-progress',
    child: playPause,
    overlays: [progressbar],
    pass_through: true,
  });

  const prev = Widget.Button(
    {
      class_name: 'media-button',
      on_clicked: () => {
        player.previous();
        activePlayer = player;
      },
      visible: player.bind('can_go_prev'),
    },
    Widget.Label({ class_name: 'material-icons', label: 'skip_previous' }),
  );

  const next = Widget.Button(
    {
      class_name: 'media-button',
      on_clicked: () => {
        player.next();
        activePlayer = player;
      },
      visible: player.bind('can_go_next'),
    },
    Widget.Label({ class_name: 'material-icons', label: 'skip_next' }),
  );

  const totalLength = Widget.Box(
    {
      class_name: 'media-position',
      spacing: 6,
      hpack: 'end',
      setup: (self) => {
        function update(self) {
          self.visible = player.length > 0;
        }
        self.hook(mpris, update, 'player-changed');
      },
    },
    Widget.Label({
      setup: (self) => {
        function update(_: any) {
          self.label = lengthToDuration(player.position);
        }
        self.hook(player, update, 'position');
        self.poll(1000, update);
      },
    }),
    Widget.Label('/'),
    Widget.Label({
      setup: (self) => {
        function update(_: any) {
          self.label = lengthToDuration(player.length);
        }
        self.hook(player, update);
        player.connect('position', update);
      },
    }),
  );

  const pin = Widget.ToggleButton({
    class_name: 'media-toggle',
    child: Widget.Label({
      class_name: 'material-icons',
      label: 'keep',
    }),
    setup: (self) => {
      self.active = isPinned;
      self.toggleClassName('toggle-active', isPinned);
    },
    on_toggled: ({ active }) => {
      pin.toggleClassName('toggle-active', active);
      activePlayer = player;
      isPinned = active;
      pinned = active;
      updated = true;
      mpris.emit('player-changed', player.bus_name);
    },
  });

  return Widget.Box(
    { class_name: 'player' },
    Widget.Box([thumbnail]),
    Widget.Box(
      {
        vertical: true,
        hexpand: true,
      },
      Widget.CenterBox({
        start_widget: title,
        end_widget: Widget.Box([pin]),
      }),
      Widget.Box([artist]),
      Widget.Box({ vexpand: true }),
      Widget.CenterBox({
        start_widget: Widget.Box({
          class_name: 'media-controls',
          spacing: 8,
          children: [prev, next],
        }),
        end_widget: Widget.Box({
          class_name: 'media-controls',
          hpack: 'end',
          spacing: 20,
          children: [totalLength, playProgress],
        }),
      }),
    ),
  );
}

let updated = false;
let pinned = false;

// TODO: intelligent repopulation - skip deleting and adding existing players.
// only change new players. this will help optimise this and make flickering
// even less.
// TODO: automatically update the active player if an active player is closed
const mediaPopup = Widget.Window({
  class_name: 'media-popup',
  visible: false,
  anchor: ['top'],
  margins: [6, 0],
  child: Widget.Box({
    class_name: 'media-contents',
    vertical: true,
    spacing: 4,
    setup: (self) => {
      function update(_: any) {
        // Check if we even need to update the list
        const mprisBusNames = filterPlayers(mpris.players).map(
          (v) => v.bus_name,
        );
        if (compareArrays(mprisBusNames, trackedBusNames) && !updated) return;
        updated = false;
        // If we need to update the tracked buses
        trackedBusNames = filterPlayers(mpris.players).map((v) => v.bus_name);
        // Delete old children
        self.get_children().forEach((child) => {
          child.destroy();
        });
        // Get a list of new children
        const filtered = filterPlayers(mpris.players)
          .sort((v) => (v == activePlayer ? 0 : 1))
          .sort((v) => (v.metadata['mpris:artUrl'] != null ? 0 : 1));
        // Append the new children to the object
        if (pinned) {
          self.add(Player(filtered[0], true));
        } else {
          for (const child of filtered) {
            self.add(Player(child));
          }
        }
      }
      // Update the children whenever a player is changed
      self.hook(mpris, update, 'player_changed');
    },
  }),
});

const mediaButton = Widget.Button({
  class_name: 'media-button',
  child: Widget.Label({
    truncate: 'end',
    maxWidthChars: 32,
    label: 'Media',
  }).hook(
    mpris,
    (self) => {
      if (mpris.players.length > 0) {
        const { track_artists, track_title } =
          activePlayer ?? filterPlayers(mpris.players)[0];
        const artists = track_artists.length
          ? track_artists.join(', ')
          : 'Artist';
        const title = track_title.length ? track_title : 'Title';
        self.label = `${artists} - ${title}`;
      } else {
        self.label = 'Nothing is playing';
      }
    },
    'player-changed',
  ),
  on_clicked: () => {
    mediaPopup.visible = !mediaPopup.visible;
  },
});

export default function MediaControls() {
  return Widget.Box({
    class_name: 'media',
    children: [mediaButton],
  });
}
