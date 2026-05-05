import { createHandler, refreshStoredSnapshot } from "./router.mjs";
import { D1Store, MemoryStore } from "./store.mjs";

export default {
  fetch(request, env) {
    return createHandler(new D1Store(env.DB), env).fetch(request);
  },

  scheduled(_event, env, ctx) {
    ctx.waitUntil(refreshStoredSnapshot(new D1Store(env.DB)));
  },
};

export { createHandler, refreshStoredSnapshot, D1Store, MemoryStore };
