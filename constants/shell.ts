export const shellPalette = {
  bg: '#F4F1EB',
  panel: '#FFFFFF',
  panelSoft: '#EEF2F0',
  panelMuted: '#F7F8FA',
  border: 'rgba(28, 41, 56, 0.09)',
  text: '#172233',
  textSoft: '#58667B',
  textMuted: '#8592A3',
  accent: '#3E9D78',
  accentStrong: '#2D7E61',
  accentSoft: '#D9F0E5',
  success: '#34A56F',
  warning: '#E7A34B',
  danger: '#D56468',
  info: '#5A88E5',
  contrast: '#1F2A3A',
  contrastSoft: '#2D3A4D',
  contrastText: '#F5F8FB',
  shadow: 'rgba(20, 31, 46, 0.10)',
} as const;

export const projectPhases = [
  {
    key: 'foundation',
    label: 'Foundation',
    title: 'Snapshot shell and product framing',
    description:
      'Lock the free/premium model, the public-data-first posture, and the scheduled snapshot narrative.',
    status: 'In progress',
  },
  {
    key: 'publicData',
    label: 'Public data',
    title: 'Macro, energy, and safer evidence',
    description:
      'Prioritize public and attribution-friendly sources before any expansion into licensed market data.',
    status: 'Planned',
  },
  {
    key: 'premium',
    label: 'Premium',
    title: 'Subscriptions, paywall, and entitlements',
    description:
      'Unlock depth, history, watchlists, and alerts before introducing ads.',
    status: 'Planned',
  },
  {
    key: 'ads',
    label: 'Ads',
    title: 'Native ads only in free, only later',
    description:
      'Introduce native ads only after subscriptions, and only in placements that do not damage trust.',
    status: 'Deferred',
  },
  {
    key: 'release',
    label: 'Release',
    title: 'Backend hardening and App Store path',
    description:
      'Prepare backend hosting, App Store subscriptions, legal copy, and the macOS/Xcode handoff later.',
    status: 'Blocked on macOS',
  },
] as const;

export const dashboardCards = [
  {
    key: 'regime',
    title: 'Global capital regime',
    value: 'Snapshot-first, not real-time-first',
    detail:
      'The first commercial iOS release should read from scheduled backend snapshots instead of live vendor calls per app open.',
  },
  {
    key: 'tiers',
    title: 'Free and Premium',
    value: 'Free proves value, Premium deepens it',
    detail:
      'Free should stay useful and honest; Premium should unlock depth, convenience, and an ad-free experience.',
  },
  {
    key: 'sources',
    title: 'Commercial posture',
    value: 'Public-data-first',
    detail:
      'The commercial iOS plan should avoid leaning on Twelve Data and Alpha Vantage until rights and economics are solved.',
  },
] as const;

export const roadmapItems = [
  'Ship a useful free tier with the latest stored snapshot, selected baskets, and shorter history windows.',
  'Add Premium as the first monetization layer for full drilldowns, longer history, watchlists, and alerts.',
  'Keep the commercial positioning tied to public-data-first sources and scheduled backend refreshes.',
  'Leave native ads for later, and only for the free tier in clearly separated placements.',
] as const;

export const accessTiers = [
  {
    key: 'free',
    label: 'Free',
    title: 'Useful without pretending to be a live terminal',
    value: 'Latest stored snapshot, selected baskets, shorter history',
    detail:
      'Free should prove the product with honest scheduled updates, basic evidence, and no fake real-time promise.',
    points: [
      'Main regime snapshot',
      'Selected baskets and shorter history windows',
      'No exports, no advanced alerts, no watchlist sync',
      'Native ads only from a later phase and only in safe placements',
    ],
  },
  {
    key: 'premium',
    label: 'Premium',
    title: 'Depth, convenience, and no ads',
    value: 'Full drilldowns, longer history, watchlists, alerts',
    detail:
      'Premium should monetize extra depth and convenience rather than access to questionable raw vendor display rights.',
    points: [
      'Full basket drilldowns and deeper history',
      'Watchlists, alerts, and richer asset detail once legally safe',
      'Priority access to new product layers',
      'Always ad-free',
    ],
  },
] as const;

export const operatingPrinciples = [
  {
    key: 'cadence',
    title: 'Refresh cadence',
    value: 'Start with 1-4 snapshots per day',
    detail:
      'Refresh after meaningful market or macro windows, not every time someone opens the app.',
  },
  {
    key: 'sources',
    title: 'Source posture',
    value: 'Public-data-first',
    detail:
      'Build the commercial story around FRED, EIA, ECB, and World Bank style sources before licensed market feeds.',
  },
  {
    key: 'backend',
    title: 'Backend rule',
    value: 'One backend, many clients',
    detail:
      'The app reads our backend snapshots; provider keys and refresh logic stay outside the phone.',
  },
] as const;

export const legalBoundaryNotes = [
  'Do not promise exchange-grade real-time coverage in v1.',
  'Do not position Twelve Data or Alpha Vantage as part of the commercial iOS source mix for now.',
  'Do show freshness, provenance, and whether a screen is reading the latest stored snapshot.',
] as const;
