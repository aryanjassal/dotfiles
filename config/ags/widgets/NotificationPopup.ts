const Notifications = await Service.import("notifications");

function NotificationIcon({ app_name, app_icon, image }) {
  if (image) {
    return Widget.Box({
      css:
        `background-image: url("${image}");` +
        "background-size: contain;" +
        "background-repeat: no-repeat;" +
        "background-position: center;",
    });
  }

  let icon = "dialog-information-symbolic";
  if (Utils.lookUpIcon(app_icon)) icon = app_icon;

  if (app_name && Utils.lookUpIcon(app_name.toLowerCase())) {
    icon = app_name.toLowerCase();
  } else if (app_icon && Utils.lookUpIcon(app_icon)) {
    icon = app_icon;
  }

  return Widget.Box({
    child: Widget.Icon(icon),
  });
}

function Notification(n) {
  const icon = Widget.Box({
    vpack: "start",
    class_name: "icon",
    child: NotificationIcon(n),
  });

  const title = Widget.Label({
    class_name: "title",
    xalign: 0,
    justification: "left",
    hexpand: true,
    max_width_chars: 24,
    truncate: "end",
    wrap: true,
    label: n.summary,
    use_markup: true,
  });

  const body = Widget.Label({
    class_name: "body",
    hexpand: true,
    use_markup: true,
    xalign: 0,
    justification: "left",
    label: n.body,
    wrap: true,
    max_width_chars: 24,
  });

  const actions = Widget.Box({
    class_name: "actions",
    children: n.actions.map(({ id, label }) =>
      Widget.Button({
        class_name: "action-button",
        on_clicked: () => {
          n.invoke(id);
          n.dismiss();
        },
        hexpand: true,
        child: Widget.Label(label),
      }),
    ),
  });

  return Widget.EventBox(
    {
      attribute: { id: n.id },
      on_primary_click: n.dismiss,
    },
    Widget.Box(
      {
        class_name: `notification ${n.urgency}`,
        vertical: true,
      },
      Widget.Box([icon, Widget.Box({ vertical: true }, title, body)]),
      actions,
    ),
  );
}

export default function NotificationPopups(monitor = 0) {
  const list = Widget.Box({
    vertical: true,
    children: Notifications.popups.map(Notification),
  });

  function onNotified(_, /** @type {number} */ id) {
    const n = Notifications.getNotification(id);
    if (n) list.children = [Notification(n), ...list.children];
  }

  function onDismissed(_, /** @type {number} */ id) {
    list.children.find((n) => n.attribute.id === id)?.destroy();
  }

  list
    .hook(Notifications, onNotified, "notified")
    .hook(Notifications, onDismissed, "dismissed")
    .hook(Notifications, onDismissed, "closed") ;

  return Widget.Window({
    monitor,
    name: `notifications${monitor}`,
    class_name: "notification-popups",
    anchor: ["top", "right"],
    child: Widget.Box({
      css: "min-width: 2px; min-height: 2px;",
      class_name: "notifications",
      vertical: true,
      child: list,

      /** this is a simple one liner that could be used instead of
                hooking into the 'notified' and 'dismissed' signals.
                but its not very optimized becuase it will recreate
                the whole list everytime a notification is added or dismissed */
      // children: notifications.bind('popups')
      //     .as(popups => popups.map(Notification))
    }),
  });
}
