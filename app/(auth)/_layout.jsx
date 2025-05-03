import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="auth1" />
      <Stack.Screen name="auth2" />
      <Stack.Screen name="auth3" />
    </Stack>
  );
} 