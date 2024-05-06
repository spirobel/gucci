import type { Subprocess } from "bun";
import { makeEntrypoint, standardDevReloader } from "@spirobel/mininext";

dev(await makeEntrypoint());
export default async function dev(entryPoint: (w: any) => Promise<Response>) {
  global.Reloader = standardDevReloader;
  Bun.serve({
    fetch: entryPoint,
  });

  if (!global.buildProcess) {
    global.buildProcess = Bun.spawn({
      cmd: ["bun", "run", "build.ts", "dev"],
      stdio: ["inherit", "inherit", "inherit"],
    });
  }

  console.log("listening on: http://localhost:3000");
}
declare global {
  var buildProcess: null | Subprocess;
}
