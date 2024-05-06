import type { Subprocess } from "bun";
import { build, standardDevReloader } from "@spirobel/mininext";

async function makeEntrypoint() {
  let module;

  try {
    // @ts-ignore
    module = await import("./dist/backend.js");
  } catch (error) {
    await build();
    // @ts-ignore
    module = await import("./dist/backend.js");
  }
  return module.default as (w: any) => Promise<Response>;
}
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
