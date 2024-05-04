import entryPoint from "./dist/backend.js";

dev(entryPoint);
export default async function dev(entryPoint: (w: any) => Promise<Response>) {
  Bun.serve({
    fetch: entryPoint,
  });
}
