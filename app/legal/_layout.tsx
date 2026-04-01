import { Stack } from 'expo-router';

export default function LegalLayout() {
  return (
    <Stack>
      <Stack.Screen name="terms" options={{ headerShown: false }} />
      <Stack.Screen name="privacy" options={{ headerShown: false }} />
      <Stack.Screen name="sources" options={{ headerShown: false }} />
      <Stack.Screen name="disclaimer" options={{ headerShown: false }} />
    </Stack>
  );
}
