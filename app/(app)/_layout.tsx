import { COLORS } from '@/constants/Colors';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from "expo-router";

export default function AppLayout() {

  const iconSize: number = 28;

  return (
    <Tabs 
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: COLORS.lightBlueX2,
        sceneStyle: { backgroundColor: COLORS.black },
        tabBarStyle: { backgroundColor: COLORS.black, elevation: 0, height: 40},
      }}
    >
      <Tabs.Screen name="index" options={{
        tabBarIcon: ({size, color}) => <Entypo name="home" color={color} size={iconSize} /> 
      }} />
      <Tabs.Screen name="search" options={{
        tabBarIcon: ({size, color}) => <FontAwesome name="search" color={color} size={iconSize} /> 
      }} />
      <Tabs.Screen name="profile" options={{
        tabBarIcon: ({size, color}) => <FontAwesome name="user-circle-o" color={color} size={iconSize} /> 
      }} />
    </Tabs>
  )
}
