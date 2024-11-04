const entry = App.configDir + "/main.ts";
const outdir = "/tmp/ags/js";

try {
  // @ts-ignore
  await Utils.execAsync([
    "bun",
    "build",
    entry,
    "--outdir",
    outdir,
    "--external",
    "resource://*",
    "--external",
    "gi://*",
  ]);
  // @ts-ignore
  await import(`file://${outdir}/main.js`);
} catch (error) {
  console.error(error);
}
