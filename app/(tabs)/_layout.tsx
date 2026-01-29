import { Tabs } from "expo-router"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { COLORS } from "@/theme/colors"

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.mutedForeground,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.muted,
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="home"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="registry"
        options={{
          title: "Registry",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="download"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="scanner"
        options={{
          title: "Scanner",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="qrcode-scan"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="sync"
        options={{
          title: "Sync",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="cloud-upload"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="logs"
        options={{
          title: "Logs",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="file-document"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  )
}
