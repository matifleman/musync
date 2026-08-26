import { COLORS } from '@/constants/Colors';
import { SessionProvider, useSession } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

SplashScreen.preventAutoHideAsync();

const queryClient: QueryClient = new QueryClient();

export default function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <SafeAreaProvider>
          <SafeAreaView style={{flex: 1, backgroundColor: COLORS.black}}>
              <RootNavigator />
              <Toast />
          </SafeAreaView>
        </SafeAreaProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}

function RootNavigator() {
  const [fontsLoaded, fontError] = useFonts({
    'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf'),
    'JetBrainsMono-Medium': require('@/assets/fonts/JetBrainsMono-Medium.ttf'),
  });
  const { currentUser, isBootstrapping } = useSession();

  // Keep the splash screen up until fonts are ready AND the launch-time silent
  // refresh has resolved, so the app never flashes sign-in before a valid
  // session is restored.
  useEffect(() => {
    if ((fontsLoaded || fontError) && !isBootstrapping) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError, isBootstrapping]);

  if ((!fontsLoaded && !fontError) || isBootstrapping) return null;

  return (
    <Stack screenOptions={{headerShown: false,}}>
      <Stack.Protected guard={!!currentUser}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!currentUser}>
        <Stack.Screen name="sign-in" />
        <Stack.Screen name='sign-up'/>
      </Stack.Protected>
    </Stack>
  )
}
