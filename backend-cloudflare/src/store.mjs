function parseJson(value, fallback = null) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

export class D1Store {
  constructor(db) {
    if (!db) {
      throw new Error("D1 binding DB is missing. Create a D1 database and update wrangler.toml.");
    }

    this.db = db;
  }

  async getLatestSnapshot() {
    const row = await this.db.prepare(
      "SELECT payload FROM snapshots ORDER BY as_of DESC LIMIT 1",
    ).first();
    return parseJson(row?.payload);
  }

  async insertSnapshot(snapshot, now) {
    await this.db.prepare(
      "INSERT INTO snapshots (id, as_of, payload, created_at) VALUES (?, ?, ?, ?)",
    ).bind(crypto.randomUUID(), snapshot.as_of, JSON.stringify(snapshot), now).run();
  }

  async getHistory(window) {
    const result = await this.db.prepare(
      "SELECT payload FROM history_points WHERE window = ? ORDER BY timestamp ASC",
    ).bind(window).all();
    return (result.results ?? []).map((row) => parseJson(row.payload)).filter(Boolean);
  }

  async replaceHistory(window, points) {
    await this.db.prepare("DELETE FROM history_points WHERE window = ?").bind(window).run();
    for (const point of points) {
      await this.db.prepare(
        "INSERT INTO history_points (id, window, timestamp, payload) VALUES (?, ?, ?, ?)",
      ).bind(crypto.randomUUID(), window, point.timestamp, JSON.stringify(point)).run();
    }
  }

  async getUserByEmail(email) {
    return await this.db.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
  }

  async getUserById(id) {
    return await this.db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();
  }

  async createUser(user) {
    await this.db.prepare(
      `INSERT INTO users (
        id, email, password_hash, password_salt, email_verified, email_verified_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      user.id,
      user.email,
      user.password_hash,
      user.password_salt,
      user.email_verified ? 1 : 0,
      user.email_verified_at,
      user.created_at,
      user.updated_at,
    ).run();
  }

  async verifyUser(userId, verifiedAt) {
    await this.db.prepare(
      "UPDATE users SET email_verified = 1, email_verified_at = ?, updated_at = ? WHERE id = ?",
    ).bind(verifiedAt, verifiedAt, userId).run();
  }

  async createVerification(record) {
    await this.db.prepare(
      "INSERT INTO email_verifications (token_hash, user_id, expires_at, used_at, created_at) VALUES (?, ?, ?, ?, ?)",
    ).bind(record.token_hash, record.user_id, record.expires_at, null, record.created_at).run();
  }

  async getVerification(tokenHash) {
    return await this.db.prepare(
      "SELECT * FROM email_verifications WHERE token_hash = ?",
    ).bind(tokenHash).first();
  }

  async markVerificationUsed(tokenHash, usedAt) {
    await this.db.prepare(
      "UPDATE email_verifications SET used_at = ? WHERE token_hash = ?",
    ).bind(usedAt, tokenHash).run();
  }

  async createSession(record) {
    await this.db.prepare(
      "INSERT INTO sessions (token_hash, user_id, expires_at, created_at, revoked_at) VALUES (?, ?, ?, ?, ?)",
    ).bind(record.token_hash, record.user_id, record.expires_at, record.created_at, null).run();
  }

  async getSession(tokenHash) {
    return await this.db.prepare("SELECT * FROM sessions WHERE token_hash = ?").bind(tokenHash).first();
  }

  async revokeSession(tokenHash, revokedAt) {
    await this.db.prepare(
      "UPDATE sessions SET revoked_at = ? WHERE token_hash = ?",
    ).bind(revokedAt, tokenHash).run();
  }

  async getEntitlement(userId) {
    return await this.db.prepare("SELECT * FROM entitlements WHERE user_id = ?").bind(userId).first();
  }

  async setEntitlement(record) {
    await this.db.prepare(
      `INSERT INTO entitlements (
        user_id, access_tier, plan, source, billing_provider, updated_at, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        access_tier = excluded.access_tier,
        plan = excluded.plan,
        source = excluded.source,
        billing_provider = excluded.billing_provider,
        updated_at = excluded.updated_at,
        expires_at = excluded.expires_at`,
    ).bind(
      record.user_id,
      record.access_tier,
      record.plan,
      record.source,
      record.billing_provider,
      record.updated_at,
      record.expires_at,
    ).run();
  }

  async insertJobRun(record) {
    await this.db.prepare(
      "INSERT INTO job_runs (id, job_name, status, message, created_at) VALUES (?, ?, ?, ?, ?)",
    ).bind(crypto.randomUUID(), record.job_name, record.status, record.message, record.created_at).run();
  }

  async recordWebhook(record) {
    await this.db.prepare(
      "INSERT INTO webhook_events (id, provider, event_type, payload, created_at) VALUES (?, ?, ?, ?, ?)",
    ).bind(
      crypto.randomUUID(),
      record.provider,
      record.event_type,
      JSON.stringify(record.payload),
      record.created_at,
    ).run();
  }
}

export class MemoryStore {
  constructor() {
    this.snapshots = [];
    this.history = new Map();
    this.users = new Map();
    this.usersByEmail = new Map();
    this.verifications = new Map();
    this.sessions = new Map();
    this.entitlements = new Map();
    this.jobRuns = [];
    this.webhooks = [];
  }

  async getLatestSnapshot() {
    return clone(this.snapshots.at(-1));
  }

  async insertSnapshot(snapshot) {
    this.snapshots.push(clone(snapshot));
  }

  async getHistory(window) {
    return clone(this.history.get(window) ?? []);
  }

  async replaceHistory(window, points) {
    this.history.set(window, clone(points));
  }

  async getUserByEmail(email) {
    const id = this.usersByEmail.get(email);
    return id ? clone(this.users.get(id)) : null;
  }

  async getUserById(id) {
    return clone(this.users.get(id) ?? null);
  }

  async createUser(user) {
    this.users.set(user.id, clone(user));
    this.usersByEmail.set(user.email, user.id);
  }

  async verifyUser(userId, verifiedAt) {
    const user = this.users.get(userId);
    if (user) {
      user.email_verified = true;
      user.email_verified_at = verifiedAt;
      user.updated_at = verifiedAt;
    }
  }

  async createVerification(record) {
    this.verifications.set(record.token_hash, clone(record));
  }

  async getVerification(tokenHash) {
    return clone(this.verifications.get(tokenHash) ?? null);
  }

  async markVerificationUsed(tokenHash, usedAt) {
    const record = this.verifications.get(tokenHash);
    if (record) {
      record.used_at = usedAt;
    }
  }

  async createSession(record) {
    this.sessions.set(record.token_hash, clone(record));
  }

  async getSession(tokenHash) {
    return clone(this.sessions.get(tokenHash) ?? null);
  }

  async revokeSession(tokenHash, revokedAt) {
    const record = this.sessions.get(tokenHash);
    if (record) {
      record.revoked_at = revokedAt;
    }
  }

  async getEntitlement(userId) {
    return clone(this.entitlements.get(userId) ?? null);
  }

  async setEntitlement(record) {
    this.entitlements.set(record.user_id, clone(record));
  }

  async insertJobRun(record) {
    this.jobRuns.push(clone(record));
  }

  async recordWebhook(record) {
    this.webhooks.push(clone(record));
  }
}
