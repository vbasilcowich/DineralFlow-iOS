import { useEffect, useRef, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { APP_DOCK_SCREEN_SPACER } from '@/components/floating-app-dock';
import { ActionButton, Pill, SectionCard } from '@/components/shell';
import { shellPalette } from '@/constants/shell';
import { useAuth } from '@/hooks/use-auth';
import { useMonetization } from '@/hooks/use-monetization';
import { usePaywallConfig } from '@/hooks/use-paywall-config';
import { formatLocalizedDateTime } from '@/lib/dashboard-presenter';
import { useLanguage } from '@/lib/language';
import {
  localizeErrorMessage,
  localizeStaticText,
  localizeStatusValue,
  localizeSyncMessage,
} from '@/lib/localized-copy';
import {
  getFeatureDescriptor,
  isEntitlementFeature,
  PAYWALL_PLAN_COPY,
} from '@/lib/monetization';

export default function PaywallScreen() {
  const router = useRouter();
  const auth = useAuth();
  const monetization = useMonetization();
  const { language } = useLanguage();
  const isPremium = monetization.accessTier === 'premium';
  const requiresAuthenticatedBackend = auth.providerMode === 'backend' && !auth.isAuthenticated;
  const usingMockBilling = monetization.billingProvider === 'mock';
  const usingRevenueCatBilling = monetization.billingProvider === 'revenuecat';
  const didSyncOnOpenRef = useRef(false);
  const [legalError, setLegalError] = useState<string | null>(null);
  const params = useLocalSearchParams<{ feature?: string | string[] }>();
  const featureParam = Array.isArray(params.feature) ? params.feature[0] : params.feature;
  const focusedFeature = featureParam && isEntitlementFeature(featureParam) ? featureParam : null;
  const focusedDescriptor = focusedFeature ? getFeatureDescriptor(focusedFeature) : null;
  const paywallConfig = usePaywallConfig(
    focusedFeature,
    monetization.entitlements,
    auth.providerMode === 'backend' ? auth.accessToken : null,
  );
  const localizePaywallText = (text: string) => localizeStaticText(text, language);
  const formatContractRevision = (revision: string) => {
    if (language !== 'es') {
      return revision;
    }

    const localMatch = revision.match(/^local-fallback\.v(\d+)$/);
    if (localMatch) {
      return `Revision local v${localMatch[1]}`;
    }

    return revision.replace(/_/g, ' ');
  };
  const copy = language === 'es'
    ? {
        premium: 'Premium',
        mockBilling: 'Facturacion de prueba',
        revenueCatBilling: 'Facturacion RevenueCat',
        backendPaywall: 'Contrato premium del backend',
        localFallback: 'Respaldo premium local',
        focus: 'Foco',
        currentAccess: 'Acceso actual',
        currentAccessPremium: 'El acceso premium esta activo',
        currentAccessFree: 'La capa gratis esta activa',
        currentAccessBodyPremium: 'Este estado desbloquea desgloses mas profundos, mas historico, futuras listas de seguimiento y una experiencia sin anuncios.',
        currentAccessBodyFree: 'La capa gratis mantiene legible la lectura principal y reserva mas profundidad y futuras funciones de comodidad para premium.',
        tier: 'Nivel',
        plan: 'Plan',
        source: 'Fuente',
        contract: 'Contrato',
        billing: 'Facturacion',
        openedFrom: 'Esta pantalla premium se abrio desde la ruta de mejora de',
        entitlementsSync: 'Sincronizacion de accesos',
        contractRevision: 'Revision del contrato',
        lastAccessSync: 'Ultima sincronizacion de acceso',
        paywallFallback: 'Respaldo de configuracion premium',
        lastAction: 'Ultima accion',
        error: 'Error',
        premiumAdds: 'Que anade premium',
        premiumAddsTitle: 'Vendemos profundidad, no canales ruidosos',
        premiumAddsBody: 'Premium debe monetizar una interpretacion mas rica y comodidad. Esta primera implementacion mantiene la promesa estrecha y honesta.',
        plans: 'Planes',
        plansTitleReadyNative: 'Las compras con RevenueCat estan listas para compilaciones nativas',
        plansTitleReady: 'Acciones de compra listas para la fase 1',
        plansTitleBlocked: 'La configuracion de facturacion sigue bloqueando el inicio de compra real',
        plansBodyReadyNative: 'Esta compilacion puede iniciar compras con RevenueCat en una compilacion nativa de desarrollo o en TestFlight. Web y Expo Go solo muestran la estructura premium.',
        plansBodyReady: 'Estas acciones estan listas para el modo de facturacion actual. En esta compilacion siguen usando un flujo seguro de desarrollo.',
        plansBodyNativeBlocked: 'Esta compilacion puede mostrar la estructura premium, pero el inicio real de compra necesita facturacion nativa iOS y la configuracion que falta.',
        plansBodyBlocked: 'El inicio de facturacion esta desactivado hasta que se configure el proveedor actual.',
        activate: 'Activar',
        start: 'Empezar',
        planNoteNative: 'Necesita una compilacion nativa de iPhone o iPad para iniciar el pago real.',
        planNoteSignIn: 'Primero necesitamos tu cuenta para vincular el acceso premium al backend.',
        planNoteMock: 'Esta ruta sigue siendo de desarrollo, pero ya modela el alta premium.',
        planNoteReady: 'Listo para iniciar el flujo premium configurado para esta compilacion.',
        bestValue: 'Mejor valor',
        legalLinks: 'Enlaces legales',
        legalLinksTitle: 'Usar los destinos legales del backend desde el contrato premium actual',
        legalLinksBody: 'El texto comercial y los enlaces legales deben venir del mismo contrato para que la capa comercial siga siendo auditable.',
        openTerms: 'Abrir terminos',
        openPrivacy: 'Abrir privacidad',
        legalUnavailable: 'Este enlace legal no esta disponible en el contrato actual.',
        legalOpenFailed: 'No se pudo abrir el enlace legal.',
        restore: 'Restaurar y resetear',
        restoreTitleMock: 'Transiciones de estado que necesitamos antes de la facturacion real',
        restoreTitleReal: 'Restaurar y sincronizar el estado de acceso',
        restoreBodyMock: 'Restaurar compras y gestionar bajadas de nivel es critico. Esta pantalla premium de desarrollo mantiene esos flujos probables desde ahora.',
        restoreBodyReal: 'En compilaciones con RevenueCat debemos centrarnos en restaurar y sincronizar. Volver a gratis queda como atajo solo para desarrollo de prueba.',
        refreshAccess: 'Actualizar acceso',
        restorePurchases: 'Restaurar compras',
        resetToFree: 'Volver a gratis',
      }
    : {
        premium: 'Premium',
        mockBilling: 'Mock billing',
        revenueCatBilling: 'RevenueCat billing',
        backendPaywall: 'Backend paywall',
        localFallback: 'Local paywall fallback',
        focus: 'Focus',
        currentAccess: 'Current access',
        currentAccessPremium: 'Premium access is active',
        currentAccessFree: 'Free tier is active',
        currentAccessBodyPremium: 'This state unlocks deeper drilldowns, longer history, future watchlists, and an ad-free experience.',
        currentAccessBodyFree: 'The free tier keeps the main snapshot readable while reserving deeper depth and future convenience features for premium.',
        tier: 'Tier',
        plan: 'Plan',
        source: 'Source',
        contract: 'Contract',
        billing: 'Billing',
        openedFrom: 'This paywall was opened from the upgrade path for',
        entitlementsSync: 'Entitlements sync',
        contractRevision: 'Contract revision',
        lastAccessSync: 'Last access sync',
        paywallFallback: 'Paywall config fallback',
        lastAction: 'Last action',
        error: 'Error',
        premiumAdds: 'What premium adds',
        premiumAddsTitle: 'Sell depth, not noisy feeds',
        premiumAddsBody: 'Premium should monetize richer interpretation and convenience. The first implementation keeps the promise intentionally narrow and honest.',
        plans: 'Plans',
        plansTitleReadyNative: 'RevenueCat purchase actions are ready for native builds',
        plansTitleReady: 'Purchase actions for phase 1',
        plansTitleBlocked: 'Billing setup still blocks real purchase start',
        plansBodyReadyNative: 'This build can start RevenueCat purchases in a native development build or TestFlight build. Web and Expo Go still only preview the paywall shell.',
        plansBodyReady: 'These actions are ready for the current billing mode. In this build they still use a safe development flow.',
        plansBodyNativeBlocked: 'This build can show the paywall shell, but real purchase start needs native iOS billing setup and the missing configuration values.',
        plansBodyBlocked: 'Billing start is disabled until the current provider is configured.',
        activate: 'Activate',
        start: 'Start',
        planNoteNative: 'A native iPhone or iPad build is still required before real checkout can start.',
        planNoteSignIn: 'We need your account first so premium access can be linked to the backend.',
        planNoteMock: 'This path is still for development, but it already models the premium upgrade flow.',
        planNoteReady: 'Ready to start the premium flow configured for this build.',
        bestValue: 'Best value',
        legalLinks: 'Legal links',
        legalLinksTitle: 'Use the backend legal destinations from the current paywall contract',
        legalLinksBody: 'The paywall copy and legal links should come from the same contract so the commercial layer stays auditable.',
        openTerms: 'Open terms',
        openPrivacy: 'Open privacy',
        legalUnavailable: 'This legal link is not available in the current contract.',
        legalOpenFailed: 'Could not open the legal link.',
        restore: 'Restore and reset',
        restoreTitleMock: 'State transitions we need before real billing',
        restoreTitleReal: 'Restore and sync access state',
        restoreBodyMock: 'Restore purchases and downgrade handling are product-critical. This development paywall keeps those flows testable now.',
        restoreBodyReal: 'RevenueCat builds should focus on restore and sync. Resetting to free remains a mock-only developer shortcut.',
        refreshAccess: 'Refresh access',
        restorePurchases: 'Restore purchases',
        resetToFree: 'Reset to free',
      };
  const heroTitle = focusedDescriptor
    ? isPremium
      ? language === 'es'
        ? `${localizePaywallText(focusedDescriptor.title)} ya forma parte de premium.`
        : `${localizePaywallText(focusedDescriptor.title)} is already part of premium.`
      : localizePaywallText(paywallConfig.config.headline)
    : isPremium
      ? language === 'es'
        ? 'Premium ya esta desbloqueado en esta compilacion de desarrollo.'
        : 'Premium is unlocked in this development build.'
      : localizePaywallText(paywallConfig.config.headline);
  const heroBody = focusedDescriptor
    ? localizePaywallText(paywallConfig.config.body)
    : localizePaywallText(paywallConfig.config.body);

  useEffect(() => {
    if (didSyncOnOpenRef.current) {
      return;
    }

    didSyncOnOpenRef.current = true;
    void monetization.syncEntitlements('paywall_opened');
  }, [monetization]);

  const openLegalLink = (url?: string | null) => {
    if (!url) {
      setLegalError(copy.legalUnavailable);
      return;
    }

    setLegalError(null);

    if (url.startsWith('/')) {
      router.push(url as never);
      return;
    }

    if (!/^https?:\/\//i.test(url)) {
      return;
    }

    void Linking.openURL(url).catch(() => {
      setLegalError(copy.legalOpenFailed);
    });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Pill label={copy.premium} tone={isPremium ? 'success' : 'accent'} />
        <Pill
          label={usingMockBilling ? copy.mockBilling : copy.revenueCatBilling}
          tone={usingMockBilling ? 'warning' : 'info'}
        />
        <Pill
          label={paywallConfig.source === 'backend' ? copy.backendPaywall : copy.localFallback}
          tone={paywallConfig.source === 'backend' ? 'success' : 'soft'}
        />
        {focusedDescriptor ? (
          <Pill label={`${copy.focus}: ${localizePaywallText(focusedDescriptor.title)}`} tone="soft" />
        ) : null}
        <Text style={styles.title}>{heroTitle}</Text>
        <Text style={styles.body}>{heroBody}</Text>
      </View>

      <SectionCard
        eyebrow={copy.currentAccess}
        title={isPremium ? copy.currentAccessPremium : copy.currentAccessFree}
        body={
          isPremium
            ? copy.currentAccessBodyPremium
            : copy.currentAccessBodyFree
        }>
        <View style={styles.badgeRow}>
          <Pill label={`${copy.tier}: ${localizeStatusValue(monetization.accessTier, language)}`} tone={isPremium ? 'success' : 'info'} />
          {monetization.entitlements.plan ? (
            <Pill label={`${copy.plan}: ${localizeStatusValue(monetization.entitlements.plan, language)}`} tone="soft" />
          ) : null}
          <Pill label={`${copy.source}: ${localizeStatusValue(monetization.entitlements.source, language)}`} tone="soft" />
          <Pill label={`${copy.contract}: ${localizeStatusValue(monetization.entitlementsContractState, language)}`} tone="soft" />
          <Pill label={`${copy.billing}: ${localizeStatusValue(monetization.billingStatus, language)}`} tone="soft" />
        </View>
        {focusedDescriptor ? (
          <Text style={styles.metaText}>
            {copy.openedFrom} {localizePaywallText(focusedDescriptor.title)}.
          </Text>
        ) : null}
        <Text style={styles.metaText}>
          {copy.entitlementsSync}: {localizeStatusValue(monetization.entitlementsSyncStatus, language)}
        </Text>
        <Text style={styles.metaText}>
          {copy.contractRevision}: {formatContractRevision(monetization.entitlementsContractVersion)}
        </Text>
        {monetization.entitlementsLastSyncAt ? (
          <Text style={styles.metaText}>
            {copy.lastAccessSync}: {formatLocalizedDateTime(monetization.entitlementsLastSyncAt, language)}
          </Text>
        ) : null}
        {monetization.entitlementsSyncMessage ? (
          <Text style={styles.metaText}>{localizeSyncMessage(monetization.entitlementsSyncMessage, language)}</Text>
        ) : null}
        {paywallConfig.errorMessage ? (
          <Text style={styles.metaText}>
            {copy.paywallFallback}: {localizeErrorMessage(paywallConfig.errorMessage, language)}
          </Text>
        ) : null}
        <Text style={styles.metaText}>{localizeErrorMessage(monetization.billingStatusMessage, language)}</Text>
        {monetization.lastAction ? (
          <Text style={styles.metaText}>
            {copy.lastAction}: {localizeErrorMessage(monetization.lastAction, language)}
          </Text>
        ) : null}
        {monetization.errorMessage ? (
          <Text style={styles.errorText}>
            {copy.error}: {localizeErrorMessage(monetization.errorMessage, language)}
          </Text>
        ) : null}
      </SectionCard>

      {requiresAuthenticatedBackend ? (
        <SectionCard
          eyebrow={language === 'es' ? 'Cuenta necesaria' : 'Account required'}
          title={language === 'es' ? 'Inicia sesion para usar el backend autenticado' : 'Sign in to use the authenticated backend'}
          body={language === 'es'
            ? 'El acceso premium y la sincronizacion de estado se apoyan en la sesion autenticada cuando esta disponible.'
            : 'Premium access and state sync rely on the authenticated session when available.'}>
          <View style={styles.buttonRow}>
            <ActionButton
              label={language === 'es' ? 'Entrar' : 'Sign in'}
              icon="arrow.right"
              variant="primary"
              onPress={() => router.push('/auth/login' as never)}
            />
            <ActionButton
              label={language === 'es' ? 'Crear cuenta' : 'Create account'}
              icon="arrow.right"
              variant="secondary"
              onPress={() => router.push('/auth/register' as never)}
            />
          </View>
          {auth.verificationRequired ? (
            <ActionButton
              label={language === 'es' ? 'Verificar email' : 'Verify email'}
              icon="arrow.right"
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: '/auth/verify-email' as never,
                  params: {
                    email: auth.pendingVerificationEmail ?? auth.userEmail ?? '',
                    token: auth.pendingVerificationToken ?? '',
                    verificationUrl: auth.pendingVerificationUrl ?? '',
                  },
                } as never)
              }
            />
          ) : null}
        </SectionCard>
      ) : null}

      <SectionCard
        eyebrow={copy.premiumAdds}
        title={copy.premiumAddsTitle}
        body={copy.premiumAddsBody}>
        <View style={styles.featureList}>
          {paywallConfig.config.highlights.map((item) => (
            <Text key={item} style={styles.featureItem}>
              - {localizePaywallText(item)}
            </Text>
          ))}
        </View>
      </SectionCard>

      <SectionCard
        eyebrow={copy.plans}
        title={
          monetization.canStartPurchase
            ? usingRevenueCatBilling
              ? copy.plansTitleReadyNative
              : copy.plansTitleReady
            : copy.plansTitleBlocked
        }
        body={
          monetization.canStartPurchase
            ? usingRevenueCatBilling
              ? copy.plansBodyReadyNative
              : copy.plansBodyReady
            : monetization.requiresNativeBillingBuild
              ? copy.plansBodyNativeBlocked
              : copy.plansBodyBlocked
        }
        variant="contrast">
        <View style={styles.planGrid}>
          {PAYWALL_PLAN_COPY.map((plan) => {
            const isAnnual = plan.key === 'annual';
            const planActionNote = requiresAuthenticatedBackend
              ? copy.planNoteSignIn
              : monetization.requiresNativeBillingBuild && usingRevenueCatBilling
                ? copy.planNoteNative
                : usingMockBilling
                  ? copy.planNoteMock
                  : copy.planNoteReady;

            return (
            <View
              key={plan.key}
              style={[
                styles.planCard,
                isAnnual ? styles.planCardAnnual : styles.planCardMonthly,
              ]}>
              <View style={styles.planHeader}>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.78}
                  style={[styles.planTitle, isAnnual && styles.planTitleAnnual]}>
                  {localizePaywallText(plan.title)}
                </Text>
                {isAnnual ? <Pill label={copy.bestValue} tone="info" /> : null}
              </View>
              <Text style={[styles.planDetail, isAnnual && styles.planDetailAnnual]}>
                {localizePaywallText(plan.detail)}
              </Text>
              <ActionButton
                label={
                  usingMockBilling
                    ? `${copy.activate} ${localizePaywallText(plan.title)}`
                    : `${copy.start} ${localizePaywallText(plan.title)}`
                }
                icon="arrow.right"
                variant={isAnnual ? 'purchaseAlt' : 'purchase'}
                testID={`paywall-plan-${plan.key}`}
                disabled={
                  (!monetization.canStartPurchase && !requiresAuthenticatedBackend) ||
                  monetization.isProcessing
                }
                onPress={() => {
                if (requiresAuthenticatedBackend) {
                    router.push('/auth/login' as never);
                    return;
                  }

                  void monetization.purchasePremium(plan.key);
                }}
              />
              <Text style={[styles.planNote, isAnnual && styles.planNoteAnnual]}>
                {planActionNote}
              </Text>
            </View>
          )})}
        </View>
      </SectionCard>

      <SectionCard
        eyebrow={copy.legalLinks}
        title={copy.legalLinksTitle}
        body={copy.legalLinksBody}>
        <View style={styles.buttonRow}>
          <ActionButton
            label={copy.openTerms}
            icon="arrow.right"
            testID="paywall-open-terms"
            onPress={() => openLegalLink(paywallConfig.config.legal_links.terms_url)}
          />
          <ActionButton
            label={copy.openPrivacy}
            icon="arrow.right"
            testID="paywall-open-privacy"
            onPress={() => openLegalLink(paywallConfig.config.legal_links.privacy_url)}
          />
          <ActionButton
            label={language === 'es' ? 'Abrir fuentes' : 'Open sources'}
            icon="arrow.right"
            testID="paywall-open-sources"
            onPress={() => openLegalLink(paywallConfig.config.legal_links.data_sources_url)}
          />
          <ActionButton
            label={language === 'es' ? 'Abrir disclaimer' : 'Open disclaimer'}
            icon="arrow.right"
            testID="paywall-open-disclaimer"
            onPress={() => openLegalLink(paywallConfig.config.legal_links.financial_disclaimer_url)}
          />
        </View>
        {legalError ? <Text style={styles.errorText}>{legalError}</Text> : null}
      </SectionCard>

      <SectionCard
        eyebrow={copy.restore}
        title={usingMockBilling ? copy.restoreTitleMock : copy.restoreTitleReal}
        body={
          usingMockBilling
            ? copy.restoreBodyMock
            : copy.restoreBodyReal
        }>
        <View style={styles.buttonRow}>
            <ActionButton
              label={copy.refreshAccess}
              icon="arrow.clockwise"
              testID="paywall-refresh-access"
              disabled={monetization.isProcessing}
              onPress={() => {
                if (requiresAuthenticatedBackend) {
                  router.push('/auth/login' as never);
                  return;
                }

                void monetization.syncEntitlements();
              }}
            />
            <ActionButton
              label={copy.restorePurchases}
              icon="arrow.clockwise"
              testID="paywall-restore-purchases"
              disabled={monetization.isProcessing}
              onPress={() => {
                if (requiresAuthenticatedBackend) {
                  router.push('/auth/login' as never);
                  return;
                }

                void monetization.restorePurchases();
              }}
            />
            {usingMockBilling ? (
              <ActionButton
                label={copy.resetToFree}
                icon="folder.fill"
                testID="paywall-reset-free"
                disabled={monetization.isProcessing}
                onPress={() => void monetization.resetToFree()}
              />
            ) : null}
          </View>
        </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: shellPalette.bg,
  },
  content: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: APP_DOCK_SCREEN_SPACER,
    gap: 18,
  },
  hero: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: shellPalette.contrast,
    borderWidth: 1,
    borderColor: 'rgba(245,248,251,0.08)',
    gap: 12,
    shadowColor: shellPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  title: {
    color: shellPalette.contrastText,
    fontSize: 30,
    lineHeight: 35,
    fontWeight: '900',
    letterSpacing: 0,
  },
  body: {
    color: 'rgba(245,248,251,0.78)',
    fontSize: 15,
    lineHeight: 22,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaText: {
    color: shellPalette.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  errorText: {
    color: shellPalette.danger,
    fontSize: 13,
    lineHeight: 18,
  },
  featureList: {
    gap: 10,
  },
  featureItem: {
    color: shellPalette.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  planGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  planCard: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 150,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  planCardMonthly: {
    backgroundColor: '#ECF8F2',
    borderColor: 'rgba(45,126,97,0.28)',
  },
  planCardAnnual: {
    backgroundColor: '#223146',
    borderColor: 'rgba(90,136,229,0.34)',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  planTitle: {
    color: shellPalette.text,
    fontSize: 18,
    fontWeight: '800',
  },
  planTitleAnnual: {
    color: shellPalette.contrastText,
  },
  planDetail: {
    color: shellPalette.textSoft,
    fontSize: 13.5,
    lineHeight: 20,
  },
  planDetailAnnual: {
    color: 'rgba(245,248,251,0.80)',
  },
  planNote: {
    color: shellPalette.textSoft,
    fontSize: 12.5,
    lineHeight: 18,
  },
  planNoteAnnual: {
    color: 'rgba(245,248,251,0.68)',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
