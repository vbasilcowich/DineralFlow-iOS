// Matchers such as `toBeOnTheScreen` are provided by
// `@testing-library/react-native` in current versions.

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-purchases', () => {
  const mockPurchases = {
    setLogLevel: jest.fn(async () => undefined),
    configure: jest.fn(),
    isConfigured: jest.fn(async () => true),
    getCustomerInfo: jest.fn(async () => ({
      entitlements: { active: {}, all: {}, verification: 'NOT_REQUESTED' },
      activeSubscriptions: [],
      allPurchasedProductIdentifiers: [],
      latestExpirationDate: null,
      firstSeen: '2026-03-30T00:00:00Z',
      originalAppUserId: 'anonymous',
      requestDate: '2026-03-30T00:00:00Z',
      allExpirationDates: {},
      allPurchaseDates: {},
      originalApplicationVersion: null,
      originalPurchaseDate: null,
      managementURL: null,
      nonSubscriptionTransactions: [],
      subscriptionsByProductIdentifier: {},
    })),
    getOfferings: jest.fn(async () => ({
      all: {},
      current: null,
    })),
    purchasePackage: jest.fn(async () => ({
      customerInfo: {
        entitlements: { active: {}, all: {}, verification: 'NOT_REQUESTED' },
        activeSubscriptions: [],
        allPurchasedProductIdentifiers: [],
        latestExpirationDate: null,
        firstSeen: '2026-03-30T00:00:00Z',
        originalAppUserId: 'anonymous',
        requestDate: '2026-03-30T00:00:00Z',
        allExpirationDates: {},
        allPurchaseDates: {},
        originalApplicationVersion: null,
        originalPurchaseDate: null,
        managementURL: null,
        nonSubscriptionTransactions: [],
        subscriptionsByProductIdentifier: {},
      },
      productIdentifier: 'monthly',
    })),
    restorePurchases: jest.fn(async () => ({
      entitlements: { active: {}, all: {}, verification: 'NOT_REQUESTED' },
      activeSubscriptions: [],
      allPurchasedProductIdentifiers: [],
      latestExpirationDate: null,
      firstSeen: '2026-03-30T00:00:00Z',
      originalAppUserId: 'anonymous',
      requestDate: '2026-03-30T00:00:00Z',
      allExpirationDates: {},
      allPurchaseDates: {},
      originalApplicationVersion: null,
      originalPurchaseDate: null,
      managementURL: null,
      nonSubscriptionTransactions: [],
      subscriptionsByProductIdentifier: {},
    })),
    PURCHASES_ERROR_CODE: {
      PURCHASE_CANCELLED_ERROR: '1',
      NETWORK_ERROR: '10',
      OFFLINE_CONNECTION_ERROR: '35',
      TEST_STORE_SIMULATED_PURCHASE_ERROR: '42',
    },
  };

  return {
    __esModule: true,
    default: mockPurchases,
    LOG_LEVEL: {
      INFO: 'INFO',
    },
    PACKAGE_TYPE: {
      MONTHLY: 'MONTHLY',
      ANNUAL: 'ANNUAL',
    },
  };
});
