const encoder = new TextEncoder();
const PBKDF2_ITERATIONS = 100000;
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const VERIFICATION_TTL_SECONDS = 60 * 60 * 24;

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

export function createUserId() {
  return `user_${crypto.randomUUID().replace(/-/g, "")}`;
}

export function createToken(prefix) {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `${prefix}_${bytesToBase64Url(bytes)}`;
}

export function addSeconds(now, seconds) {
  return new Date(new Date(now).getTime() + seconds * 1000).toISOString();
}

export function createSessionExpiry(now) {
  return addSeconds(now, SESSION_TTL_SECONDS);
}

export function createVerificationExpiry(now) {
  return addSeconds(now, VERIFICATION_TTL_SECONDS);
}

export async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(String(value)));
  return bytesToBase64Url(new Uint8Array(digest));
}

export async function hashPassword(password, salt = createToken("salt")) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(String(password)),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: encoder.encode(salt),
      iterations: PBKDF2_ITERATIONS,
    },
    key,
    256,
  );

  return {
    salt,
    hash: bytesToBase64Url(new Uint8Array(bits)),
  };
}

export async function verifyPassword(password, salt, expectedHash) {
  const result = await hashPassword(password, salt);
  return result.hash === expectedHash;
}

export function publicUser(user) {
  return {
    user_id: user.id,
    email: user.email,
    email_verified: Boolean(user.email_verified),
    email_verified_at: user.email_verified_at ?? null,
    created_at: user.created_at,
  };
}
