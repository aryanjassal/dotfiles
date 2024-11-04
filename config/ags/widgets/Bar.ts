import Hyprland from "resource:///com/github/Aylur/ags/service/hyprland.js";
import Utils from "resource:///com/github/Aylur/ags/utils.js";
import MediaPlayer from "./Media.js";

const workspaces = Widget.Box({
  class_name: "workspaces",
  children: Hyprland.bind("workspaces").transform((ws) => {
    const sortedWorkspaces = ws.sort((a, b) => a.id - b.id);
    const formattedWorkspaces = [];
    const maxWorkspaces = sortedWorkspaces.reduce((max, workspace) => {
      return workspace.id > max ? workspace.id : max;
    }, 0);

    for (let i = 1; i <= maxWorkspaces; i++) {
      let icon = " ";

      const workspace = ws.find((el) => el.id == i);
      if (workspace == null) icon = " ";

      formattedWorkspaces.push(
        Widget.Button({
          on_clicked: () => Hyprland.messageAsync(`dispatch workspace ${i}`),
          child: Widget.Label(icon),
          class_name: Hyprland.active.workspace
            .bind("id")
            .transform((activeId) => `${activeId == i ? "focused" : ""}`),
        }),
      );
    }
    return formattedWorkspaces;
  }),
});

const clock = Widget.Label({
  class_name: "clock",
  setup: (self) =>
    self.poll(1000, (self) =>
      Utils.execAsync(["date", "+%I:%M %p"]).then(
        (date) => (self.label = date),
      ),
    ),
});

const date = Widget.Label({
  class_name: "clock",
  setup: (self) =>
    self.poll(60000, (self) =>
      Utils.execAsync(["date", "+%e %B %+4Y"]).then(
        (date) => (self.label = date),
      ),
    ),
});

const barLeft = Widget.Box({
  spacing: 8,
  children: [],
});

const barCenter = Widget.Box({
  spacing: 8,
  children: [workspaces, MediaPlayer()],
});

const barRight = Widget.Box({
  spacing: 8,
  children: [clock, date],
});

export default (monitor = 0) =>
  Widget.Window({
    name: `bar-${monitor}`,
    class_name: "bar",
    margins: [0],
    monitor: monitor,
    anchor: ["top", "left", "right"],
    exclusivity: "exclusive",
    child: Widget.CenterBox({
      start_widget: barLeft,
      center_widget: barCenter,
      end_widget: barRight,
    }),
  });
