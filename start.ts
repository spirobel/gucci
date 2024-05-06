import { makeEntrypoint } from "@spirobel/mininext";

dev(await makeEntrypoint());
export default async function dev(entryPoint: (w: any) => Promise<Response>) {
  Bun.serve({
    fetch: entryPoint,
  });
}
