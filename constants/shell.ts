export const shellPalette = {
  bg: '#08111C',
  panel: '#0F1B2A',
  panelSoft: '#132235',
  border: 'rgba(191, 208, 225, 0.14)',
  text: '#EAF0F6',
  textSoft: '#9FB0C5',
  textMuted: '#73869E',
  accent: '#D4AF37',
  accentSoft: '#F1E1A6',
  success: '#7CD6A6',
  warning: '#F6C36A',
  danger: '#F08C8C',
  info: '#79B8FF',
} as const;

export const projectPhases = [
  {
    key: 'foundation',
    label: 'Foundation',
    title: 'Repo, navigation, and visual system',
    description:
      'Keep the app small, testable, and visually consistent before bringing in market data.',
    status: 'In progress',
  },
  {
    key: 'parity',
    label: 'Parity',
    title: 'Dashboard, baskets, and asset drilldowns',
    description:
      'Recreate the product structure from the web in a mobile-first format with honest placeholders.',
    status: 'Planned',
  },
  {
    key: 'data',
    label: 'Data',
    title: 'Local API, provenance, and freshness',
    description:
      'Connect the iOS app to the same backend snapshot, source metadata, and live-status signals.',
    status: 'Planned',
  },
  {
    key: 'release',
    label: 'Release',
    title: 'macOS build path and device testing',
    description:
      'Prepare the macOS/Xcode handoff needed for simulator builds, signing, and TestFlight later.',
    status: 'Blocked on macOS',
  },
] as const;

export const dashboardCards = [
  {
    key: 'regime',
    title: 'Global capital regime',
    value: 'Defined as a guided dashboard shell',
    detail: 'The first iOS release will show the same basket logic, but with simplified reading paths.',
  },
  {
    key: 'evidence',
    title: 'Data evidence',
    value: 'Source-aware and audit-friendly',
    detail: 'Every future metric should show where it came from, when it was updated, and how it is derived.',
  },
  {
    key: 'platform',
    title: 'Current platform scope',
    value: 'Expo / React Native on Windows',
    detail: 'This repo is practical for local development and testing here; native iOS builds still need macOS.',
  },
] as const;

export const roadmapItems = [
  'Bring over the top-level dashboard narrative and the key confidence signals.',
  'Translate baskets into mobile cards with readable drivers, frictions, and provenance.',
  'Expose asset detail as a drilldown with a 30-day chart and source metadata.',
  'Keep language, freshness, and live-status indicators consistent across screens.',
] as const;
