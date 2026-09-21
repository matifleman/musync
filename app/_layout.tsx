import { COLORS } from '@/constants/Colors';
import { SessionProvider, useSession } from '@/contexts/AuthContext';
import { useDeepLinkReplay } from '@/hooks/useDeepLinkReplay';
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
  // A new account goes through onboarding before it can reach the app; accounts that
  // predate the flow were backfilled as onboarded, and a second device gets the flag from
  // the server, so neither sees it.
  const onboarded = !!currentUser?.onboardingCompleted;

  // Must run before the early return below: this component still mounts (and so
  // still runs effects) while it renders null behind the splash screen, which is
  // how a link that cold-started the app gets captured.
  useDeepLinkReplay();

  // Keep the splash screen up until fonts are ready AND the launch-time silent
  // refresh has resolved, so the app never flashes sign-in before a valid
  // session is restored.
  useEffect(() => {
    if ((fontsLoaded || fontError) && !isBootstrapping) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError, isBootstrapping]);

  if ((!fontsLoaded && !fontError) || isBootstrapping) return null;

  return (
    <Stack screenOptions={{headerShown: false,}}>
      {/* Every one of these has to be named explicitly. Stack.Protected only
          guards screens declared as its children - a route file that is merely
          present on disk gets auto-registered and stays reachable, which is how
          these detail screens were previously open to signed-out callers. */}
      <Stack.Protected guard={!!currentUser && onboarded}>
        <Stack.Screen name="(app)" />
        <Stack.Screen name="user/[userId]" />
        <Stack.Screen name="band/[bandId]" />
        <Stack.Screen name="band/edit/[bandId]" />
        <Stack.Screen name="release/[releaseId]" />
        <Stack.Screen name="post/[postId]" />
        <Stack.Screen name="list/[listType]" />
        <Stack.Screen name="profile/edit" />
      </Stack.Protected>
      <Stack.Protected guard={!!currentUser && !onboarded}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={!currentUser}>
        <Stack.Screen name="sign-in" />
        <Stack.Screen name='sign-up'/>
      </Stack.Protected>
    </Stack>
  )
}
