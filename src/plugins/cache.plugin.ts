import { caching } from "cache-manager";
import Elysia from "elysia";

import { toBase64 } from "@root/utils/base64";
import { isNill } from "@root/utils/is-nill";

export const cachePlugin = new Elysia({
  name: "Plugin.Cache"
}).decorate(
  "memory",
  await caching("memory", {
    max: 100,
    ttl: 10 * 1000 /*milliseconds*/
  })
);

export const autoCachingPlugin = new Elysia({
  name: "Plugin.AutoCaching"
})
  .use(cachePlugin)
  .onRequest(async ({ memory, request }) => {
    const key = toBase64(request.url);

    const value = await memory.get(key);

    if (!isNill(value)) {
      return value;
    }
  })
  .onAfterHandle({ as: "scoped" }, async ({ request, memory, response }) => {
    const key = toBase64(request.url);

    await memory.set(key, response);
  });
