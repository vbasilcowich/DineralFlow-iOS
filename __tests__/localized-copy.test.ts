import {
  localizeErrorMessage,
  localizeStaticText,
  localizeStatusValue,
  localizeSyncMessage,
} from '@/lib/localized-copy';

describe('localized copy helpers', () => {
  it('keeps English unchanged and translates known Spanish product copy', () => {
    expect(localizeStaticText('Premium unlocks the deeper workflow.', 'en')).toBe(
      'Premium unlocks the deeper workflow.',
    );
    expect(localizeStaticText('Premium unlocks the deeper workflow.', 'es')).toBe(
      'Premium desbloquea el flujo mas profundo.',
    );
  });

  it('localizes visible status values and technical errors', () => {
    expect(localizeStatusValue('backend_sync', 'es')).toBe('Backend sincronizado');
    expect(localizeStatusValue('requires_native_build', 'es')).toBe('Requiere compilacion nativa');
    expect(localizeErrorMessage('paywall_config_failed', 'es')).toBe(
      'No se pudo cargar la configuracion premium.',
    );
    expect(localizeErrorMessage('http_401', 'es')).toBe('La API devolvio HTTP 401.');
  });

  it('localizes cached entitlement sync failure messages', () => {
    expect(
      localizeSyncMessage(
        'Using cached access rules after sync failure: http_500',
        'es',
      ),
    ).toBe('Usando reglas de acceso en memoria local tras fallar la sincronizacion: La API devolvio HTTP 500.');
  });
});
