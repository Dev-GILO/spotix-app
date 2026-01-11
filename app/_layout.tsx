"use client"
import { Stack } from "expo-router"
import { AuthProvider } from "@/context/AuthContext"  
import { SplashScreen } from "@/components/SplashScreen"
import { useAuth } from "@/hooks/useAuth"

const RootLayout = () => {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  )
}

const RootLayoutContent = () => {
  const { isInitializing, user } = useAuth()

  if (isInitializing) {
    return <SplashScreen />
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#f8f7fa" },
      }}
    >
      {user ? (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      )}
    </Stack>
  )
}

export default RootLayout