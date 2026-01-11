"use client"

import { useEffect } from "react"
import { useFonts } from "expo-font"
import * as SplashScreen from "expo-splash-screen"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import RootLayout from "./app/_layout"

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync()

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceMonoRegular: require("@expo-google-fonts/space-mono").SpaceMono_400Regular,
    SpaceMonoBold: require("@expo-google-fonts/space-mono").SpaceMono_700Bold,
  })

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  if (!fontsLoaded && !fontError) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootLayout />
    </GestureHandlerRootView>
  )
}
