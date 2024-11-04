import NotificationPopups from "widgets/NotificationPopup";
import Bar from "widgets/Bar"

Utils.notify({
  appName: "System",
  summary: "AGS running",
  iconName: "info-symbolic",
  body: "AGS is running in the background as a notification daemon.",
});

App.config({
  style: App.configDir + "/style.css",
  windows: [NotificationPopups(), Bar()],
  notificationPopupTimeout: 10000,
});
