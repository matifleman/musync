import { COLORS } from '@/constants/Colors';
import { SessionProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

SplashScreen.preventAutoHideAsync();

const queryClient: QueryClient = new QueryClient();

export default function Root() {
  const [fontsLoaded, fontError] = useFonts({
    'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf'),
    'JetBrainsMono-Medium': require('@/assets/fonts/JetBrainsMono-Medium.ttf'),
  });

  useEffect(() => {
    if(fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);
    
  if(!fontsLoaded && !fontError) return;
  
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
  return ( 
    <Stack screenOptions={{headerShown: false,}}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name='sign-up'/>
    </Stack>
  )
}