import assert from "node:assert/strict";
import test from "node:test";

import { createHandler, MemoryStore, refreshStoredSnapshot } from "../src/index.mjs";
import { sha256 } from "../src/auth.mjs";

function request(path, init = {}) {
  return new Request(`https://api.test${path}`, init);
}

async function json(response) {
  return await response.json();
}

test("health and dashboard endpoints expose the iOS contract", async () => {
  const store = new MemoryStore();
  const app = createHandler(store, { APP_ENV: "test" });

  const health = await app.fetch(request("/health"));
  assert.equal(health.status, 200);
  assert.equal((await json(health)).status, "ok");

  const snapshot = await app.fetch(request("/api/dashboard/snapshot"));
  const snapshotPayload = await json(snapshot);
  assert.equal(snapshot.status, 200);
  assert.equal(snapshotPayload.market_brief.version, "market_brief.public_data.v1");
  assert.equal(snapshotPayload.top_flows[0].bucket_key, "risk_on");
  assert.ok(snapshotPayload.data_freshness.seconds_since_refresh >= 0);

  const history = await app.fetch(request("/api/dashboard/history?window=30d"));
  const historyPayload = await json(history);
  assert.equal(history.status, 200);
  assert.equal(historyPayload.window, "30d");
  assert.ok(historyPayload.points.length > 0);
});

test("auth flow registers, verifies, logs in, fetches me, and logs out", async () => {
  const store = new MemoryStore();
  const app = createHandler(store, {
    APP_ENV: "test",
    PUBLIC_BASE_URL: "https://api.test",
  });

  const register = await app.fetch(request("/api/mobile/auth/register", {
    method: "POST",
    body: JSON.stringify({ email: "Demo@Example.com", password: "supersecure" }),
  }));
  const registerPayload = await json(register);
  assert.equal(register.status, 200);
  assert.equal(registerPayload.user.email, "demo@example.com");
  assert.ok(registerPayload.development_verification_token);

  const loginBeforeVerify = await app.fetch(request("/api/mobile/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "demo@example.com", password: "supersecure" }),
  }));
  assert.equal(loginBeforeVerify.status, 403);

  const verify = await app.fetch(request("/api/mobile/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token: registerPayload.development_verification_token }),
  }));
  assert.equal(verify.status, 200);
  assert.equal((await json(verify)).verified, true);

  const login = await app.fetch(request("/api/mobile/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "demo@example.com", password: "supersecure" }),
  }));
  const loginPayload = await json(login);
  assert.equal(login.status, 200);
  assert.ok(loginPayload.access_token);

  const me = await app.fetch(request("/api/mobile/auth/me", {
    headers: { authorization: `Bearer ${loginPayload.access_token}` },
  }));
  assert.equal(me.status, 200);
  assert.equal((await json(me)).user.email, "demo@example.com");

  const logout = await app.fetch(request("/api/mobile/auth/logout", {
    method: "POST",
    headers: { authorization: `Bearer ${loginPayload.access_token}` },
  }));
  assert.equal(logout.status, 200);

  const meAfterLogout = await app.fetch(request("/api/mobile/auth/me", {
    headers: { authorization: `Bearer ${loginPayload.access_token}` },
  }));
  assert.equal(meAfterLogout.status, 401);
});

test("entitlements and paywall work for anonymous and authenticated clients", async () => {
  const store = new MemoryStore();
  const app = createHandler(store, { APP_ENV: "test" });

  const anonymousEntitlements = await app.fetch(request("/api/mobile/entitlements"));
  const anonymousPayload = await json(anonymousEntitlements);
  assert.equal(anonymousEntitlements.status, 200);
  assert.equal(anonymousPayload.access_tier, "free");
  assert.deepEqual(anonymousPayload.limits.allowed_history_windows, ["7d"]);

  const mirroredPremium = await app.fetch(request("/api/mobile/entitlements/refresh", {
    method: "POST",
    body: JSON.stringify({
      reason: "manual_retry",
      billing_state: {
        access_tier: "premium",
        plan: "annual",
        source: "revenuecat_sync",
        billing_provider: "revenuecat",
      },
    }),
  }));
  const mirroredPayload = await json(mirroredPremium);
  assert.equal(mirroredPremium.status, 200);
  assert.equal(mirroredPayload.access_tier, "premium");
  assert.equal(mirroredPayload.billing_provider, "revenuecat");

  const paywall = await app.fetch(request("/api/mobile/paywall?feature=long_history"));
  const paywallPayload = await json(paywall);
  assert.equal(paywall.status, 200);
  assert.equal(paywallPayload.default_feature, "long_history");
  assert.equal(paywallPayload.entitlement_id, "premium");
});

test("scheduled refresh stores snapshots, history, and job runs", async () => {
  const store = new MemoryStore();
  await refreshStoredSnapshot(store);

  const snapshot = await store.getLatestSnapshot();
  const history = await store.getHistory("7d");

  assert.equal(snapshot.source_mode, "partial_live");
  assert.ok(history.length > 0);
  assert.equal(store.jobRuns[0].status, "ok");
});

test("RevenueCat webhook records events and can mirror premium state", async () => {
  const store = new MemoryStore();
  const app = createHandler(store, {
    REVENUECAT_WEBHOOK_SECRET: "secret",
  });
  const userId = "user_revenuecat";
  await store.setEntitlement({
    user_id: userId,
    access_tier: "free",
    plan: null,
    source: "backend",
    billing_provider: "none",
    updated_at: new Date().toISOString(),
    expires_at: null,
  });

  const denied = await app.fetch(request("/api/mobile/webhooks/revenuecat", {
    method: "POST",
    headers: { authorization: "Bearer wrong" },
    body: JSON.stringify({ event: { type: "INITIAL_PURCHASE", app_user_id: userId } }),
  }));
  assert.equal(denied.status, 401);

  const accepted = await app.fetch(request("/api/mobile/webhooks/revenuecat", {
    method: "POST",
    headers: { authorization: "Bearer secret" },
    body: JSON.stringify({ event: { type: "INITIAL_PURCHASE", app_user_id: userId, product_id: "annual" } }),
  }));
  assert.equal(accepted.status, 200);
  assert.equal(store.webhooks.length, 1);
  assert.equal((await store.getEntitlement(userId)).access_tier, "premium");
});

test("session tokens are stored hashed", async () => {
  const token = "df_session_demo";
  const hash = await sha256(token);

  assert.notEqual(hash, token);
  assert.ok(hash.length > 20);
});
