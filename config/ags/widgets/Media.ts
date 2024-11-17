import type { MprisPlayer } from 'types/service/mpris';
import type { PlaybackStatus } from 'widgets/types';
import { MediaEventEmitter } from './events';
import { compareArrays, lengthToDuration } from 'utils';

const mpris = await Service.import('mpris');
const mediaEvents = new MediaEventEmitter();

let activePlayer: MprisPlayer = getActivePlayer(mpris.players);

const players: Map<string, Player> = new Map();

function getActivePlayer(players: MprisPlayer[]): MprisPlayer {
  if (players.length === 1) return players[0];
  players = players.filter((v) => v.play_back_status === 'Playing');
  if (players.length === 1) return players[0];
  players = players.filter((v) => v.metadata['mpris:artUrl'] == null);
  return players[0];
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

/**
 * Binds to a MprisPlayer and returns the current song's thumbnail as a
 * Widget.Box.
 * @param player The MprisPlayer to get the song info from.
 * @returns Widget.Box with the song thumbnail
 */
const MediaThumbnail = (player: MprisPlayer) => {
  return Widget.Box({
    class_name: 'img',
    vpack: 'start',
    css: player.bind('metadata').transform((meta) => {
      const url = meta['mpris:artUrl'] || `${App.configDir}/assets/disc.png`;
      return `background-image: url('${url}');`;
    }),
  });
};

/**
 * Binds to a MprisPlayer and returns the current song title inside a
 * Widget.Label.
 * @param player The MprisPlayer to get the song info from.
 * @returns Widget.Label with the song title
 */
const MediaTitle = (player: MprisPlayer) => {
  return Widget.Label({
    justification: 'left',
    truncate: 'end',
    max_width_chars: 36,
    label: player.bind('track_title'),
  });
};

/**
 * Binds to a MprisPlayer and returns a list of artists. By default, the artists
 * are comma-separated, but this can be customized using the join parameter.
 * @param player The MprisPlayer to get the song info from.
 * @param join A function dictating how to render multiple artists. Default is
 * comma-separated join.
 * @returns Widget.Label with the song artists
 */
const MediaArtist = (
  player: MprisPlayer,
  join = (artists: string[]) => artists.join(', '),
) => {
  return Widget.Label({
    class_name: 'artist',
    wrap: true,
    hpack: 'start',
    label: player.bind('track_artists').transform(join),
  });
};

/**
 * Binds to a MprisPlayer and creates a button to play the song if it is paused,
 * or pause the song if it is playing. Note that the labels use Material Icons,
 * so the label needs to contain a valid material design icon name, and it will
 * be automatically converted to the actual icon.
 * @param player The MprisPlayer to get the song info from.
 * @param icon A function which takes in the current playback status and returns
 * a corresponding icon. Default is returning material design play and pause
 * icons.
 * @returns Widget.Box with a button controlling the song playback
 */
const MediaPlayPause = (
  player: MprisPlayer,
  icon = (status: PlaybackStatus) => {
    switch (status) {
      case 'Playing':
        return 'pause';
      case 'Paused':
      case 'Stopped':
        return 'play_arrow';
    }
  },
) => {
  return Widget.Box({
    class_name: 'play-pause',
    children: [
      Widget.Button({
        on_clicked: () => {
          player.playPause();
          activePlayer = player;
        },
        visible: player.bind('can_play'),
        child: Widget.Label({
          class_name: 'material-icons',
          label: player.bind('play_back_status').transform(icon),
        }),
      }),
    ],
  });
};

/**
 * Binds to a MprisPlayer and returns the current song progress in a circular
 * progress bar.
 * @param player The MprisPlayer to get the song info from.
 * @returns Widget.CircualrProgress with the song progress
 */
const MediaProgressCircle = (player: MprisPlayer) => {
  return Widget.CircularProgress({
    class_name: 'progress',
    startAt: 0.75,
    setup: (self) => {
      // Updates the value of the progressbar based on the player's position.
      // Note that the position must be a float between 0.0 and 1.0.
      function update() {
        // Fence to avoid divide by zero.
        self.value = player.length ? player.position / player.length : 0;
      }

      // Whenever player's position changes, update the progress bar.
      // Alternatively, keep polling every second for updates just in case.
      self.hook(player, update, 'position');
      self.poll(1000, update);
    },
  });
};

// TODO: add regular slider progressbar

/**
 * Binds to a MprisPlayer and returns a binding to go to the previous song if it
 * is possible to do so.
 * @param player The MprisPlayer to get the song info from.
 * @param icon The icon name to use. Refer the Material Icons set for options.
 * @returns Widget.Button bound to play the previous song
 */
const MediaPrevious = (player: MprisPlayer, icon = 'skip_previous') => {
  return Widget.Button({
    visible: player.bind('can_go_prev'),
    child: Widget.Label({
      class_name: 'material-icons',
      label: icon,
    }),
    on_clicked: () => {
      player.previous();
      activePlayer = player;
    },
  });
};

/**
 * Binds to a MprisPlayer and returns a binding to go to the previous song if it
 * is possible to do so.
 * @param player The MprisPlayer to get the song info from.
 * @param icon The icon name to use. Refer the Material Icons set for options.
 * @returns Widget.Button bound to play the previous song
 */
const MediaNext = (player: MprisPlayer, icon = 'skip_next') => {
  return Widget.Button({
    visible: player.bind('can_go_next'),
    child: Widget.Label({
      class_name: 'material-icons',
      label: icon,
    }),
    on_clicked: () => {
      player.next();
      activePlayer = player;
    },
  });
};

const MediaPlayTime = (player: MprisPlayer) => {
  return Widget.Box({
    class_name: 'media-position',
    spacing: 6,
    setup: (self) => {
      // If no playback time information is available, then it makes no sense
      // to even render this information.
      function update() {
        self.visible = player.length > 0;
      }

      // Recalculate this whenever the player's status changes.
      self.hook(mpris, update, 'player-changed');
    },
    children: [
      Widget.Label({
        setup: (self) => {
          // Update the current time every time there is an update to it.
          function update() {
            self.label = lengthToDuration(player.position);
          }

          // Whenever player's position changes, update the playback time.
          // Alternatively, keep polling every second for updates just in case.
          self.hook(player, update, 'position');
          self.poll(1000, update);
        },
      }),
      Widget.Label('/'),
      Widget.Label({
        setup: (self) => {
          // Update the total run time every time there is an update to it.
          function update() {
            self.label = lengthToDuration(player.length);
          }

          // Whenever player's position changes, update the total run time.
          self.hook(player, update, 'position');
        },
      }),
    ],
  });
};

const MediaPin = (player: MprisPlayer) => {
  return Widget.ToggleButton({
    child: Widget.Label({
      class_name: 'material-icons',
      label: 'keep',
    }),
    setup: (self) => {
      self.on_toggled = ({ active }) => {
        self.toggleClassName('toggle-active', active);
        activePlayer = player;
        if (active) mediaEvents.emit('pinned', player.bus_name);
        else mediaEvents.emit('unpinned', player.bus_name);
      };
    },
  });
};

// TODO: in the background, add an expanded and blurred image of the album art
// instead of changing the colors of the player. a darkened and blurred image
// will look much better than just a simple color change.
class Player {
  public readonly player: MprisPlayer;
  public pinned: boolean = false;

  public constructor(player: MprisPlayer) {
    this.player = player;
    players.set(player.bus_name, this);
  }

  public isReal(): boolean {
    return (
      // playerctld just copies other buses and we don't need duplicates
      !this.player.bus_name.startsWith('org.mpris.MediaPlayer2.playerctld') &&
      // Non-instance mpd bus
      !this.player.bus_name.endsWith('.mpd') &&
      // Make sure we can actually play from the source
      this.player.can_play
    );
  }

  public generate() {
    return Widget.Box({
      class_name: 'player',
      name: this.player.bus_name,
      children: [
        Widget.Box([MediaThumbnail(this.player)]),
        Widget.Box({
          vertical: true,
          hexpand: true,
          children: [
            Widget.CenterBox({
              start_widget: Widget.Box({
                hpack: 'start',
                class_name: 'title',
                child: MediaTitle(this.player),
              }),
              end_widget: Widget.Box({
                hpack: 'end',
                child: MediaPin(this.player),
              }),
            }),
            Widget.Box([MediaArtist(this.player)]),
            Widget.Box({ vexpand: true }),
            Widget.CenterBox({
              start_widget: Widget.Box({
                class_name: 'media-controls',
                spacing: 8,
                children: [MediaPrevious(this.player), MediaNext(this.player)],
              }),
              end_widget: Widget.Box({
                class_name: 'media-controls',
                hpack: 'end',
                spacing: 20,
                children: [
                  MediaPlayTime(this.player),
                  Widget.Overlay({
                    class_name: 'media-progress',
                    child: MediaPlayPause(this.player),
                    overlays: [MediaProgressCircle(this.player)],
                    pass_through: true,
                  }),
                ],
              }),
            }),
          ],
        }),
      ],
    });
  }
}

// TODO: intelligent repopulation - skip deleting and adding existing players.
// only change new players. this will help optimise this and make flickering
// even less.
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
      function pinnedHandler(busName: string) {
        self.get_children().forEach((child) => {
          if (child.name == null) {
            // Guard against child names being null. This shouldn't happen.
            console.warn(`Child ${JSON.stringify(child)} should have a name`);
            child.destroy();
          } else if (busName != child.name) {
            // If the active player is being removed, set a new active player.
            if (activePlayer.bus_name == child.name) {
              activePlayer = getActivePlayer(mpris.players);
            }
            // If the child name is not the object we are pinning, then delete
            // it. Leave the pinned object alone.
            players.delete(child.name);
            child.destroy();
          }
        });
      }

      function unpinnedHandler(busName: string) {
        const mprisPlayers = filterPlayers(mpris.players);
        for (const mprisPlayer of mprisPlayers) {
          if (mprisPlayer.bus_name != busName) {
            // If the child is not the previously pinned object, then leave it
            // alone. We will only be adding other players after it.
            self.add(new Player(mprisPlayer).generate());
          }
        }
      }

      function updateHandler() {
        // Clear all players
        self.get_children().forEach((child) => {
          if (child.name == null) {
            // Guard against child names being null. This shouldn't happen.
            console.warn(`Child ${JSON.stringify(child)} should have a name`);
            child.destroy();
          } else {
            players.delete(child.name);
            child.destroy();
          }
        });
        // Get a list of new children
        const mprisPlayers = filterPlayers(mpris.players)
          .sort((v) => (v.metadata['mpris:artUrl'] != null ? 0 : 1))
          .sort((v) => (v.bus_name == activePlayer?.bus_name ? 0 : 1));
        // Re-create the children
        for (const mprisPlayer of mprisPlayers) {
          self.add(new Player(mprisPlayer).generate());
        }
      }

      // Remove all players except the pinned one
      mediaEvents.connect('pinned', pinnedHandler);
      // Create players for all active players except the unpinned one
      mediaEvents.connect('unpinned', unpinnedHandler);
      // Update all the players. This just recreates the entire players list.
      mediaEvents.connect('update', updateHandler);

      // Reduce the number of updates by checking for changes. Mpris fires it's
      // 'player_changed' event multiple times per change, so this is needed.
      function fenceUpdate() {
        // Get current bus names and tracked bus names
        const allBusNames = filterPlayers(mpris.players).map((v) => v.bus_name);
        const playerBusNames = [...players.keys()];
        // If they are the same, then return
        if (compareArrays(allBusNames, playerBusNames)) return;
        // Otherwise, we can update the players
        updateHandler();
      }

      // Update the children whenever a player is changed
      self.hook(mpris, fenceUpdate, 'player_changed');
    },
  }),
});

const mediaButton = Widget.Button({
  class_name: 'media-button',
  child: Widget.Label({
    truncate: 'end',
    maxWidthChars: 32,
  }).hook(
    mpris,
    (self) => {
      if (mpris.players.length > 0) {
        const { track_title } = activePlayer ?? filterPlayers(mpris.players)[0];
        const title = track_title.length ? track_title : 'Title';
        self.label = title;
      } else {
        self.label = 'Play something.';
      }
    },
    'player-changed',
  ),
  on_clicked: () => {
    mediaPopup.visible = !mediaPopup.visible;
  },
});

// TODO: update exports
export default function MediaControls() {
  return Widget.Box({
    class_name: 'media',
    children: [mediaButton],
  });
}
