import { type BottomTabNavigationOptions, createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import HomeScreen from "./index"
import RegistryScreen from "./registry"
import ScannerScreen from "./scanner"
import SyncScreen from "./sync"
import LogsScreen from "./logs"
import { COLORS } from "@/theme/colors"

const Tab = createBottomTabNavigator()

const TabBarIcon = (props: any) => <MaterialCommunityIcons {...props} />

export default function TabLayout() {
  return (
    <Tab.Navigator
      screenOptions={({ route }): BottomTabNavigationOptions => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.mutedForeground,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.muted,
          borderTopWidth: 1,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: string

          if (route.name === "index") iconName = "home"
          else if (route.name === "registry") iconName = "download"
          else if (route.name === "scanner") iconName = "qrcode-scan"
          else if (route.name === "sync") iconName = "cloud-upload"
          else iconName = "file-document"

          return <TabBarIcon name={iconName} size={size} color={color} />
        },
        tabBarLabel:
          route.name === "index"
            ? "Home"
            : route.name === "registry"
              ? "Registry"
              : route.name === "scanner"
                ? "Scanner"
                : route.name === "sync"
                  ? "Sync"
                  : "Logs",
      })}
    >
      <Tab.Screen name="index" component={HomeScreen} />
      <Tab.Screen name="registry" component={RegistryScreen} />
      <Tab.Screen name="scanner" component={ScannerScreen} />
      <Tab.Screen name="sync" component={SyncScreen} />
      <Tab.Screen name="logs" component={LogsScreen} />
    </Tab.Navigator>
  )
}
