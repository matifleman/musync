import { COLORS } from '@/constants/Colors';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from "expo-font";
import { SplashScreen, Tabs } from "expo-router";
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  const [fontsLoaded, fontError] = useFonts({
    'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf'),
    'JetBrainsMono-Medium': require('@/assets/fonts/JetBrainsMono-Medium.ttf'),
  });

  useEffect(() => {
    if(fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if(!fontsLoaded && !fontError) return;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.black}}>
      <Tabs 
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.lightBlueX2,
          sceneStyle: { backgroundColor: COLORS.black },
          tabBarStyle: { backgroundColor: COLORS.black },
        }}
      >
        <Tabs.Screen name="index" options={{
          tabBarLabel: "home",
          tabBarIcon: ({size, color}) => <Entypo name="home" color={color} size={size} /> 
        }} />
        <Tabs.Screen name="search" options={{
          tabBarLabel: "search",
          tabBarIcon: ({size, color}) => <FontAwesome name="search" color={color} size={size} /> 
        }} />
        <Tabs.Screen name="profile" options={{
          tabBarLabel: "profile",
          tabBarIcon: ({size, color}) => <FontAwesome name="user-circle-o" color={color} size={size} /> 
        }} />
      </Tabs>
    </SafeAreaView>
  )
}
