import type { Subprocess } from "bun";
import { standardDevReloader } from "@spirobel/mininext";
// @ts-ignore
import entryPoint from "./dist/backend.js";

dev(entryPoint);
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
