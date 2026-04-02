import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Text, View } from 'react-native';

import { AuthProvider, useAuth } from '@/hooks/use-auth';

function AuthProbe() {
  const auth = useAuth();

  return (
    <View>
      <Text testID="status">{auth.status}</Text>
      <Text testID="email">{auth.userEmail ?? ''}</Text>
      <Text testID="pending">{auth.pendingVerificationEmail ?? ''}</Text>
      <Text testID="token">{auth.accessToken ?? ''}</Text>
      <Text testID="verified">{String(auth.verificationRequired)}</Text>
      <Text testID="error">{auth.lastError ?? ''}</Text>
      <Text testID="action">{auth.lastAction ?? ''}</Text>
      <Text testID="provider">{auth.providerMode}</Text>
      <Text testID="signedin">{String(auth.isAuthenticated)}</Text>
      <Text testID="clear-error" onPress={auth.clearError}>
        clear-error
      </Text>
      <Text
        testID="login"
        onPress={() =>
          void auth.login({
            email: 'person@example.com',
            password: 'secret',
          })
        }>
        login
      </Text>
      <Text
        testID="register"
        onPress={() =>
          void auth.register({
            email: 'new@example.com',
            password: 'secret',
          })
        }>
        register
      </Text>
      <Text
        testID="login-social"
        onPress={() =>
          void auth.loginWithSocial({
            provider: 'google',
            idToken: 'social-token',
            email: 'social@example.com',
          })
        }>
        login-social
      </Text>
      <Text
        testID="verify"
        onPress={() =>
          void auth.verifyEmail({
            token: 'dev-token',
          })
        }>
        verify
      </Text>
      <Text testID="logout" onPress={() => void auth.logout()}>
        logout
      </Text>
      <Text testID="refresh" onPress={() => void auth.refreshSession()}>
        refresh
      </Text>
    </View>
  );
}

describe('AuthProvider', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('hydrates, signs in, verifies and signs out with local state', async () => {
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('status').props.children).toBe('signed_out');
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId('login'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('status').props.children).toBe('signed_in');
    });
    expect(screen.getByTestId('signedin').props.children).toBe('true');
    expect(screen.getByTestId('email').props.children).toBe('person@example.com');
    expect(screen.getByTestId('provider').props.children).toBe('mock');
    expect(screen.getByTestId('token').props.children).toBe('');

    await act(async () => {
      fireEvent.press(screen.getByTestId('verify'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('verified').props.children).toBe('false');
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId('clear-error'));
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId('logout'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('status').props.children).toBe('signed_out');
    });
    expect(screen.getByTestId('email').props.children).toBe('');
  });

  it('persists the stored session after login', async () => {
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('status').props.children).toBe('signed_out');
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId('login'));
    });

    await waitFor(async () => {
      const stored = await AsyncStorage.getItem('dineralflow:auth:session');
      expect(stored).not.toBeNull();
    });
  });

  it('supports the social sign-in helper in local mode', async () => {
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('status').props.children).toBe('signed_out');
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId('login-social'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('status').props.children).toBe('signed_in');
    });

    expect(screen.getByTestId('email').props.children).toBe('social@example.com');
  });
});
