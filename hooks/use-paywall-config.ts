import { useEffect, useState } from 'react';

import {
  createLocalPaywallFallback,
  fetchMobilePaywall,
} from '@/lib/entitlements-api';
import type { BackendPaywallResponse } from '@/lib/entitlements-contract';
import type { EntitlementFeature, EntitlementsSnapshot } from '@/lib/monetization';

export type PaywallConfigState = {
  status: 'loading' | 'ready';
  config: BackendPaywallResponse;
  source: 'backend' | 'local_fallback';
  errorMessage: string | null;
};

export function usePaywallConfig(
  feature: EntitlementFeature | null,
  entitlements: EntitlementsSnapshot,
): PaywallConfigState {
  const [state, setState] = useState<PaywallConfigState>(() => ({
    status: 'loading',
    config: createLocalPaywallFallback(feature, entitlements),
    source: 'local_fallback',
    errorMessage: null,
  }));

  useEffect(() => {
    let mounted = true;
    const fallback = createLocalPaywallFallback(feature, entitlements);

    setState({
      status: 'loading',
      config: fallback,
      source: 'local_fallback',
      errorMessage: null,
    });

    async function load() {
      try {
        const config = await fetchMobilePaywall(feature);

        if (!mounted) {
          return;
        }

        setState({
          status: 'ready',
          config,
          source: 'backend',
          errorMessage: null,
        });
      } catch (error) {
        if (!mounted) {
          return;
        }

        setState({
          status: 'ready',
          config: fallback,
          source: 'local_fallback',
          errorMessage: error instanceof Error ? error.message : 'paywall_config_failed',
        });
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [entitlements, feature]);

  return state;
}
