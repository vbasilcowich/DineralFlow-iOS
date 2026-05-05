import {
  createSessionExpiry,
  createToken,
  createUserId,
  createVerificationExpiry,
  hashPassword,
  isValidEmail,
  normalizeEmail,
  publicUser,
  sha256,
  verifyPassword,
} from "./auth.mjs";
import {
  ENTITLEMENT_FEATURES,
  HISTORY_WINDOWS,
  createEntitlementsResponse,
  createPaywallResponse,
  normalizeBillingProvider,
  normalizePlan,
  normalizeTier,
} from "./contracts.mjs";
import {
  createSeedHistory,
  createSeedSnapshot,
  refreshSnapshot,
  updateSnapshotFreshness,
} from "./seed.mjs";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type,authorization,x-revenuecat-signature",
};

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: JSON_HEADERS,
  });
}

function error(detail, status = 400) {
  return json({ detail }, status);
}

async function readJson(request) {
  if (!request.body) {
    return {};
  }

  try {
    return await request.json();
  } catch {
    throw new HttpError("invalid_json", 400);
  }
}

class HttpError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function publicBaseUrl(env) {
  return String(env.PUBLIC_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
}

function shouldExposeDevelopmentTokens(env) {
  return env.EXPOSE_DEVELOPMENT_TOKENS !== "false";
}

function getBearerToken(request) {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

async function getOptionalUser(request, store) {
  const token = getBearerToken(request);
  if (!token) {
    return null;
  }

  const tokenHash = await sha256(token);
  const session = await store.getSession(tokenHash);
  if (!session || session.revoked_at || Date.parse(session.expires_at) <= Date.now()) {
    return null;
  }

  return await store.getUserById(session.user_id);
}

async function requireUser(request, store) {
  const user = await getOptionalUser(request, store);
  if (!user) {
    throw new HttpError("unauthorized", 401);
  }

  return user;
}

async function sendVerificationEmail({ env, email, token, verificationUrl }) {
  if (!env.RESEND_API_KEY) {
    return "outbox";
  }

  const from = env.VERIFICATION_FROM_EMAIL || "DineralFlow <onboarding@resend.dev>";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: "Verify your DineralFlow account",
      text: `Use this verification link: ${verificationUrl}\n\nDevelopment token: ${token}`,
    }),
  });

  return response.ok ? "resend" : "outbox";
}

async function createSessionForUser(store, user, now) {
  const token = createToken("df_session");
  const tokenHash = await sha256(token);
  const expiresAt = createSessionExpiry(now);

  await store.createSession({
    token_hash: tokenHash,
    user_id: user.id,
    expires_at: expiresAt,
    created_at: now,
  });

  return {
    user: publicUser(user),
    access_token: token,
    token_type: "bearer",
    expires_at: expiresAt,
  };
}

async function register(request, store, env) {
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const password = String(body.password ?? "");

  if (!isValidEmail(email)) {
    throw new HttpError("invalid_email", 422);
  }

  if (password.length < 8) {
    throw new HttpError("password_too_short", 422);
  }

  const existing = await store.getUserByEmail(email);
  if (existing) {
    throw new HttpError("account_already_exists", 409);
  }

  const now = nowIso();
  const passwordHash = await hashPassword(password);
  const user = {
    id: createUserId(),
    email,
    password_hash: passwordHash.hash,
    password_salt: passwordHash.salt,
    email_verified: false,
    email_verified_at: null,
    created_at: now,
    updated_at: now,
  };

  await store.createUser(user);

  const verificationToken = createToken("df_verify");
  await store.createVerification({
    token_hash: await sha256(verificationToken),
    user_id: user.id,
    expires_at: createVerificationExpiry(now),
    created_at: now,
  });

  const verificationUrl = `${publicBaseUrl(env)}/api/mobile/auth/verify-email?token=${encodeURIComponent(verificationToken)}`;
  const delivery = await sendVerificationEmail({ env, email, token: verificationToken, verificationUrl });

  return json({
    user: publicUser(user),
    verification_required: true,
    verification_delivery: delivery,
    verification_expires_at: createVerificationExpiry(now),
    development_verification_token: shouldExposeDevelopmentTokens(env) ? verificationToken : null,
    development_verification_url: shouldExposeDevelopmentTokens(env) ? verificationUrl : null,
  });
}

async function login(request, store) {
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const password = String(body.password ?? "");
  const user = await store.getUserByEmail(email);

  if (!user || !(await verifyPassword(password, user.password_salt, user.password_hash))) {
    throw new HttpError("invalid_credentials", 401);
  }

  if (!user.email_verified) {
    throw new HttpError("email_verification_required", 403);
  }

  return json(await createSessionForUser(store, user, nowIso()));
}

async function verifyEmail(request, store) {
  const url = new URL(request.url);
  const body = request.method === "GET" ? {} : await readJson(request);
  const token = String(body.token ?? url.searchParams.get("token") ?? "");
  const record = token ? await store.getVerification(await sha256(token)) : null;

  if (!record || record.used_at || Date.parse(record.expires_at) <= Date.now()) {
    throw new HttpError("invalid_or_expired_verification_token", 400);
  }

  const now = nowIso();
  await store.verifyUser(record.user_id, now);
  await store.markVerificationUsed(record.token_hash, now);
  const user = await store.getUserById(record.user_id);

  return json({
    user: publicUser(user),
    verified: true,
  });
}

async function logout(request, store) {
  const token = getBearerToken(request);
  if (token) {
    await store.revokeSession(await sha256(token), nowIso());
  }

  return json({ success: true });
}

function entitlementInputFromBillingState(billingState, user = null, reason = null) {
  if (!billingState) {
    return {
      user_id: user?.id ?? null,
      access_tier: "free",
      plan: null,
      source: user ? "backend" : "fallback",
      billing_provider: "none",
      updated_at: nowIso(),
      expires_at: null,
      sync_reason: reason,
    };
  }

  const accessTier = normalizeTier(billingState.access_tier);
  const billingProvider = normalizeBillingProvider(billingState.billing_provider);

  return {
    user_id: user?.id ?? null,
    access_tier: accessTier,
    plan: accessTier === "premium" ? normalizePlan(billingState.plan) ?? "annual" : null,
    source: billingProvider === "revenuecat" ? "revenuecat_mirror" : user ? "backend" : "fallback",
    billing_provider: billingProvider,
    updated_at: billingState.purchased_at ?? nowIso(),
    expires_at: billingState.expires_at ?? null,
    sync_reason: reason,
  };
}

async function getEntitlements(request, store) {
  const user = await getOptionalUser(request, store);
  const stored = user ? await store.getEntitlement(user.id) : null;
  return json(createEntitlementsResponse(stored ?? { user_id: user?.id ?? null }));
}

async function refreshEntitlements(request, store) {
  const user = await getOptionalUser(request, store);
  const body = await readJson(request);
  const input = entitlementInputFromBillingState(body.billing_state, user, body.reason ?? null);

  if (user) {
    await store.setEntitlement({ ...input, user_id: user.id });
  }

  return json(createEntitlementsResponse(input));
}

async function paywall(request) {
  const url = new URL(request.url);
  const feature = url.searchParams.get("feature");
  return json(createPaywallResponse(feature));
}

async function dashboardSnapshot(store) {
  const now = nowIso();
  const stored = await store.getLatestSnapshot();
  const snapshot = stored ?? createSeedSnapshot(now);

  return json(updateSnapshotFreshness(snapshot, now));
}

async function dashboardHistory(request, store) {
  const url = new URL(request.url);
  const window = url.searchParams.get("window") ?? "7d";
  if (!HISTORY_WINDOWS.includes(window)) {
    throw new HttpError("invalid_history_window", 422);
  }

  const stored = await store.getHistory(window);
  const points = stored.length > 0 ? stored : createSeedHistory(window);
  return json({ window, points });
}

async function health(env) {
  return json({
    status: "ok",
    app_name: "DineralFlow Cloudflare API",
    environment: env.APP_ENV || "development",
    enabled_market_providers: [],
    enabled_macro_providers: ["fred", "eia", "ecb", "world_bank"],
    available_jobs: ["scheduled_snapshot_refresh"],
  });
}

async function revenueCatWebhook(request, store, env) {
  const expected = env.REVENUECAT_WEBHOOK_SECRET;
  const provided =
    request.headers.get("x-revenuecat-signature") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (expected && provided !== expected) {
    throw new HttpError("invalid_webhook_signature", 401);
  }

  const payload = await readJson(request);
  const event = payload.event ?? payload;
  const eventType = String(event.type ?? payload.type ?? "unknown");
  const appUserId = String(event.app_user_id ?? event.app_user_id_alias ?? "");
  const now = nowIso();

  await store.recordWebhook({
    provider: "revenuecat",
    event_type: eventType,
    payload,
    created_at: now,
  });

  if (appUserId && ["INITIAL_PURCHASE", "RENEWAL", "PRODUCT_CHANGE", "UNCANCELLATION"].includes(eventType)) {
    await store.setEntitlement({
      user_id: appUserId,
      access_tier: "premium",
      plan: String(event.product_id ?? "").includes("month") ? "monthly" : "annual",
      source: "revenuecat_mirror",
      billing_provider: "revenuecat",
      updated_at: now,
      expires_at: event.expiration_at_ms ? new Date(Number(event.expiration_at_ms)).toISOString() : null,
    });
  }

  return json({ ok: true, mode: "recorded" });
}

export async function refreshStoredSnapshot(store) {
  const now = nowIso();
  const previous = await store.getLatestSnapshot();
  const next = refreshSnapshot(previous, now);

  await store.insertSnapshot(next, now);
  for (const window of HISTORY_WINDOWS) {
    await store.replaceHistory(window, createSeedHistory(window, now));
  }
  await store.insertJobRun({
    job_name: "scheduled_snapshot_refresh",
    status: "ok",
    message: "Stored snapshot refreshed in zero-cost seed mode.",
    created_at: now,
  });

  return next;
}

export function createHandler(store, env = {}) {
  return {
    async fetch(request) {
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: JSON_HEADERS });
      }

      try {
        const url = new URL(request.url);
        const path = url.pathname.replace(/\/$/, "") || "/";
        const routeKey = `${request.method} ${path}`;

        if (routeKey === "GET /health") return await health(env);
        if (routeKey === "GET /api/dashboard/snapshot") return await dashboardSnapshot(store);
        if (routeKey === "GET /api/dashboard/history") return await dashboardHistory(request, store);
        if (routeKey === "POST /api/mobile/auth/register") return await register(request, store, env);
        if (routeKey === "POST /api/mobile/auth/login") return await login(request, store);
        if (routeKey === "POST /api/mobile/auth/verify-email" || routeKey === "GET /api/mobile/auth/verify-email") {
          return await verifyEmail(request, store);
        }
        if (routeKey === "GET /api/mobile/auth/me") {
          const user = await requireUser(request, store);
          return json({ user: publicUser(user) });
        }
        if (routeKey === "POST /api/mobile/auth/logout") return await logout(request, store);
        if (routeKey === "GET /api/mobile/entitlements") return await getEntitlements(request, store);
        if (routeKey === "POST /api/mobile/entitlements/refresh") return await refreshEntitlements(request, store);
        if (routeKey === "GET /api/mobile/paywall") return await paywall(request);
        if (routeKey === "POST /api/mobile/webhooks/revenuecat") {
          return await revenueCatWebhook(request, store, env);
        }

        if (path.startsWith("/api/legal/")) {
          return json({
            title: path.split("/").at(-1),
            body: "Legal content is rendered natively in the iOS app for this zero-cost backend phase.",
          });
        }

        return error("not_found", 404);
      } catch (caught) {
        if (caught instanceof HttpError) {
          return error(caught.message, caught.status);
        }

        return error("internal_error", 500);
      }
    },
  };
}

export { ENTITLEMENT_FEATURES };
