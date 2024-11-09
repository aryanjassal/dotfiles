import Hyprland from 'resource:///com/github/Aylur/ags/service/hyprland.js';
import Utils from 'resource:///com/github/Aylur/ags/utils.js';
import MediaPlayer from './Media.js';
import type { Widget as AGSWidget } from 'types/@girs/gtk-3.0/gtk-3.0.cjs';

const workspaces = Widget.Box({
  class_name: 'workspaces',
  children: Hyprland.bind('workspaces').transform((ws) => {
    const sortedWorkspaces = ws.sort((a, b) => a.id - b.id);
    const formattedWorkspaces: AGSWidget[] = [];
    const maxWorkspaces = sortedWorkspaces.reduce((max, workspace) => {
      return workspace.id > max ? workspace.id : max;
    }, 0);

    for (let i = 1; i <= maxWorkspaces; i++) {
      let icon = ' ';

      const workspace = ws.find((el) => el.id == i);
      if (workspace == null) icon = ' ';

      formattedWorkspaces.push(
        Widget.Button({
          on_clicked: () => Hyprland.messageAsync(`dispatch workspace ${i}`),
          child: Widget.Label(icon),
          class_name: Hyprland.active.workspace
            .bind('id')
            .transform((activeId) => `${activeId == i ? 'focused' : ''}`),
        }),
      );
    }
    return formattedWorkspaces;
  }),
});

const clock = Widget.Label({
  class_name: 'clock',
  setup: (self) =>
    self.poll(1000, (self) =>
      Utils.execAsync(['date', '+%I:%M %p']).then(
        (date) => (self.label = date),
      ),
    ),
});

const date = Widget.Label({
  class_name: 'date',
  setup: (self) =>
    self.poll(60000, (self) =>
      Utils.execAsync(['date', '+%e %B %+4Y']).then(
        (date) => (self.label = date),
      ),
    ),
});

export default (monitor = 0) =>
  Widget.Window({
    name: `bar-${monitor}`,
    class_name: 'bar',
    margins: [0],
    monitor: monitor,
    anchor: ['top', 'left', 'right'],
    exclusivity: 'exclusive',
    child: Widget.CenterBox({
      class_name: 'bar-container',
      start_widget: Widget.Box([MediaPlayer()]),
      center_widget: Widget.CenterBox({
        center_widget: Widget.Box([workspaces]),
      }),
      end_widget: Widget.Box({
        hpack: 'end',
        children: [clock, date]
      }),
    }),
  });
