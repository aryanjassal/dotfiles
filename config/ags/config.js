import NotificationPopups from "./NotificationPopup.js";
import Bar from "./Bar.js"
// import Media from "./Media.js"

// const mediaWindow = Widget.Window({
//   name: "mpris",
//   anchor: ["top", "right"],
//   child: Media(),
// })

Utils.timeout(100, () =>
  Utils.notify({
    appName: "System",
    summary: "AGS running",
    iconName: "info-symbolic",
    body: "AGS is running in the background as a notification daemon.",
  }),
);

App.config({
  style: App.configDir + "/style.css",
  windows: [NotificationPopups(), Bar()],
  notificationPopupTimeout: 10000,
  notificationForceTimeout: 10000,
});
