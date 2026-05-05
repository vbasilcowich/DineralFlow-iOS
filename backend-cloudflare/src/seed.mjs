const PUBLIC_PROVIDERS = ["fred", "eia", "ecb", "world_bank"];

export function createSeedSnapshot(now = new Date().toISOString()) {
  const asOf = now;

  return {
    as_of: asOf,
    generated_at: now,
    audience_tier: "free",
    source_mode: "partial_live",
    effective_providers: PUBLIC_PROVIDERS,
    headline: "Public-data snapshot points to a cautious risk-on rotation.",
    global_confidence: 73.4,
    coverage: 0.82,
    data_freshness: {
      status: "fresh",
      seconds_since_refresh: 0,
    },
    leading_bucket: "risk_on",
    bucket_scores: [
      { bucket_key: "risk_on", score: 42.8, confidence: 74.2 },
      { bucket_key: "energy_complex", score: 24.5, confidence: 64.8 },
      { bucket_key: "safe_haven", score: -13.7, confidence: 58.2 },
    ],
    top_flows: [
      {
        bucket_key: "risk_on",
        score: 42.8,
        confidence: 74.2,
        drivers: ["macro_growth", "credit_spreads", "equity_momentum"],
      },
      {
        bucket_key: "energy_complex",
        score: 24.5,
        confidence: 64.8,
        drivers: ["energy_inventory", "oil_momentum"],
      },
      {
        bucket_key: "safe_haven",
        score: -13.7,
        confidence: 58.2,
        drivers: ["gold_momentum", "duration_pressure"],
      },
    ],
    risks: [
      "The snapshot is scheduled and should not be read as real-time market coverage.",
      "Public macro and energy series update at different publication cadences.",
      "Commercial market-data rights still need provider-specific review before paid launch.",
    ],
    provider_issues: [
      {
        provider_key: "market_data",
        severity: "warning",
        message: "The zero-cost backend is serving stored derived snapshots, not paid live quote feeds.",
      },
    ],
    market_brief: {
      version: "market_brief.public_data.v1",
      title: "Cautious risk-on leadership with public-data constraints",
      summary:
        "The latest stored snapshot shows equities leading with moderate confidence while energy contributes a secondary impulse. Treat the read as a scheduled analytical snapshot, not a live trading feed.",
      confidence: 73.4,
      updated_at: now,
      mode: "stored_snapshot",
      source_mode: "partial_live",
      bullets: [
        "Risk assets remain the leading theme in the stored read.",
        "Energy adds support, but confidence stays moderate because source cadence is mixed.",
        "Safe-haven pressure is not leading, though it remains a useful caveat.",
      ],
      evidence: [
        {
          signal_key: "risk_on_public_mix",
          label: "Risk-on public mix",
          provider_key: "fred",
          provider_label: "FRED/public macro proxy",
          latest_value: 42.8,
          previous_value: 36.2,
          delta_value: 6.6,
          delta_text: "+6.6",
          summary: "The stored composite improved from the prior run and supports a risk-on headline.",
          supports_theme: 1,
          last_update_at: now,
        },
        {
          signal_key: "energy_inventory_proxy",
          label: "Energy inventory proxy",
          provider_key: "eia",
          provider_label: "EIA/public energy data",
          latest_value: 24.5,
          previous_value: 20.1,
          delta_value: 4.4,
          delta_text: "+4.4",
          summary: "Energy contributes a secondary impulse, but it should be read on its release cadence.",
          supports_theme: 0.6,
          last_update_at: now,
        },
      ],
      source_labels: ["FRED", "EIA", "ECB", "World Bank"],
      disclaimer:
        "Informational analysis only. This is not investment advice and does not provide exchange-grade real-time data.",
    },
  };
}

export function refreshSnapshot(previousSnapshot = null, now = new Date().toISOString()) {
  const seed = createSeedSnapshot(now);
  const previousScore = previousSnapshot?.top_flows?.[0]?.score;
  const nextScore = typeof previousScore === "number" ? Math.max(18, Math.min(58, previousScore + 0.7)) : 42.8;

  return {
    ...seed,
    top_flows: seed.top_flows.map((flow, index) =>
      index === 0 ? { ...flow, score: Number(nextScore.toFixed(1)) } : flow,
    ),
    bucket_scores: seed.bucket_scores.map((bucket, index) =>
      index === 0 ? { ...bucket, score: Number(nextScore.toFixed(1)) } : bucket,
    ),
    market_brief: {
      ...seed.market_brief,
      summary:
        "The scheduled Worker refreshed the stored read without calling paid market-data vendors. The product remains in low-cost snapshot mode.",
      updated_at: now,
    },
  };
}

export function createSeedHistory(window = "7d", now = new Date().toISOString()) {
  const days = window === "90d" ? 12 : window === "30d" ? 8 : 5;
  const stepDays = window === "90d" ? 7 : window === "30d" ? 4 : 1;
  const nowTime = new Date(now).getTime();

  return Array.from({ length: days }, (_, index) => {
    const age = (days - index - 1) * stepDays;
    const timestamp = new Date(nowTime - age * 24 * 60 * 60 * 1000).toISOString();
    const score = 29 + index * 2.4;
    const confidence = 64 + index * 1.2;

    return {
      timestamp,
      headline: index === days - 1
        ? "Risk-on leadership strengthened in the latest stored snapshot."
        : "Stored snapshot kept risk-on as the leading theme.",
      global_confidence: Number(confidence.toFixed(1)),
      leading_bucket: "risk_on",
      leading_score: Number(score.toFixed(1)),
    };
  });
}

export function updateSnapshotFreshness(snapshot, now = new Date().toISOString()) {
  const asOf = Date.parse(snapshot?.as_of ?? now);
  const seconds = Number.isFinite(asOf)
    ? Math.max(0, Math.round((Date.parse(now) - asOf) / 1000))
    : 0;

  return {
    ...snapshot,
    data_freshness: {
      status: seconds > 60 * 60 * 24 ? "stale" : seconds > 60 * 60 * 6 ? "partial" : "fresh",
      seconds_since_refresh: seconds,
    },
  };
}
