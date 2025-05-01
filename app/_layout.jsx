import { Stack } from 'expo-router';
import { Montserrat_100Thin,
        Montserrat_200ExtraLight,
        Montserrat_300Light,
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        Montserrat_800ExtraBold,
        Montserrat_900Black,
        useFonts } from '@expo-google-fonts/montserrat';

import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AppContextProvider } from '../components/AppContextProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Montserrat_100Thin,
    Montserrat_200ExtraLight,
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_900Black,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
    <AppContextProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(screens)/index" />
        <Stack.Screen name="(screens)/splash" />
        <Stack.Screen name="(screens)/welcome" />
        <Stack.Screen name="(screens)/auth1" />
        <Stack.Screen name="(screens)/auth2" />
        <Stack.Screen name="(screens)/auth3" />
        <Stack.Screen name="(screens)/home" />
      </Stack>
    </AppContextProvider>
    </SafeAreaProvider>
  );
}