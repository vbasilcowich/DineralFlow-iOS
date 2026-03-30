import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Pressable, Text, View } from 'react-native';

import { MonetizationProvider, useMonetization } from '@/hooks/use-monetization';

function MonetizationProbe() {
  const monetization = useMonetization();

  return (
    <View>
      <Text testID="tier">{monetization.accessTier}</Text>
      <Text testID="ready">{String(monetization.isReady)}</Text>
      <Text testID="processing">{String(monetization.isProcessing)}</Text>
      <Text testID="feature-long-history">{String(monetization.hasFeature('long_history'))}</Text>
      <Pressable onPress={() => void monetization.purchaseMockPremium('monthly')}>
        <Text>activate-monthly</Text>
      </Pressable>
      <Pressable onPress={() => void monetization.restorePurchases()}>
        <Text>restore</Text>
      </Pressable>
      <Pressable onPress={() => void monetization.resetToFree()}>
        <Text>reset</Text>
      </Pressable>
    </View>
  );
}

describe('useMonetization provider', () => {
  it('hydrates to a ready free state by default', async () => {
    render(
      <MonetizationProvider>
        <MonetizationProbe />
      </MonetizationProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('ready').props.children).toBe('true');
    });

    expect(screen.getByTestId('tier').props.children).toBe('free');
    expect(screen.getByTestId('feature-long-history').props.children).toBe('false');
  });

  it('switches to premium after a mock purchase and returns to free after reset', async () => {
    render(
      <MonetizationProvider>
        <MonetizationProbe />
      </MonetizationProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('ready').props.children).toBe('true');
    });

    await act(async () => {
      fireEvent.press(screen.getByText('activate-monthly'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('tier').props.children).toBe('premium');
    });
    expect(screen.getByTestId('feature-long-history').props.children).toBe('true');

    await act(async () => {
      fireEvent.press(screen.getByText('reset'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('tier').props.children).toBe('free');
    });
    expect(screen.getByTestId('feature-long-history').props.children).toBe('false');
  });

  it('can restore a cached premium state after a mock purchase', async () => {
    render(
      <MonetizationProvider>
        <MonetizationProbe />
      </MonetizationProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('ready').props.children).toBe('true');
    });

    await act(async () => {
      fireEvent.press(screen.getByText('activate-monthly'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('tier').props.children).toBe('premium');
    });

    await act(async () => {
      fireEvent.press(screen.getByText('restore'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('tier').props.children).toBe('premium');
    });
  });
});
