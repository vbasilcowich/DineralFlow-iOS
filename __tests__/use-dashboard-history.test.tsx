import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Pressable, Text, View } from 'react-native';

import { useDashboardHistory } from '@/hooks/use-dashboard-history';

const mockFetchDashboardHistory = jest.fn();

jest.mock('@/lib/api-config', () => ({
  getApiBaseUrl: () => 'http://127.0.0.1:8000',
}));

jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    providerMode: 'backend',
    accessToken: 'test-auth-token',
  }),
}));

jest.mock('@/lib/dashboard-api', () => ({
  fetchDashboardHistory: (...args: unknown[]) => mockFetchDashboardHistory(...args),
}));

function HistoryProbe({ initialWindow }: { initialWindow: '7d' | '30d' | '90d' }) {
  const history = useDashboardHistory(initialWindow);

  return (
    <View>
      <Text testID="status">{history.status}</Text>
      <Text testID="selected-window">{history.selectedWindow}</Text>
      <Text testID="history-window">{history.history?.window ?? 'none'}</Text>
      <Pressable onPress={() => history.setWindow('30d')}>
        <Text>switch-30d</Text>
      </Pressable>
      <Pressable onPress={() => history.refresh()}>
        <Text>manual-refresh</Text>
      </Pressable>
    </View>
  );
}

describe('useDashboardHistory', () => {
  beforeEach(() => {
    mockFetchDashboardHistory.mockReset();
  });

  it('loads the initial window and can switch to another one', async () => {
    mockFetchDashboardHistory
      .mockResolvedValueOnce({
        window: '7d',
        points: [],
      })
      .mockResolvedValueOnce({
        window: '30d',
        points: [],
      });

    render(<HistoryProbe initialWindow="7d" />);

    await waitFor(() => {
      expect(screen.getByTestId('history-window').props.children).toBe('7d');
    });

    await act(async () => {
      fireEvent.press(screen.getByText('switch-30d'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('selected-window').props.children).toBe('30d');
      expect(screen.getByTestId('history-window').props.children).toBe('30d');
    });

    expect(mockFetchDashboardHistory).toHaveBeenNthCalledWith(1, '7d', 'http://127.0.0.1:8000', 'test-auth-token');
    expect(mockFetchDashboardHistory).toHaveBeenNthCalledWith(2, '30d', 'http://127.0.0.1:8000', 'test-auth-token');
  });
});
