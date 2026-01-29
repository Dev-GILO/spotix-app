"use client"

import { useState, useEffect } from "react"
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  ActivityIndicator,
  Share,
  ViewStyle, 
  TextStyle 
} from "react-native"
import { useAuth } from "@/hooks/useAuth"
import { getRealm } from "@/database/realm"
import { COLORS, SPACING, TYPOGRAPHY } from "@/theme/colors"
import { ScannerServer } from "@/hooks/useScannerServer"
import type { Event } from "@/types"
import * as Network from 'expo-network'

interface ServerStats {
  totalScans: number
  successfulScans: number
  failedScans: number
  activeScannersCount: number
}

export default function ScannerScreen() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isServerRunning, setIsServerRunning] = useState(false)
  const [serverUrl, setServerUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<ServerStats>({
    totalScans: 0,
    successfulScans: 0,
    failedScans: 0,
    activeScannersCount: 0,
  })

  useEffect(() => {
    loadDownloadedEvents()
    getLocalIpAddress()

    return () => {
      // Cleanup server on unmount
      if (isServerRunning) {
        ScannerServer.stop()
      }
    }
  }, [])

  useEffect(() => {
    if (isServerRunning) {
      // Update stats every 2 seconds
      const interval = setInterval(() => {
        const currentStats = ScannerServer.getStats()
        setStats(currentStats)
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [isServerRunning])

  const loadDownloadedEvents = () => {
    try {
      const realm = getRealm()
      const localEvents = realm.objects("Event").filtered("downloadedAt != null") as any
      const eventsArray = Array.from(localEvents).map((event: any) => ({
        id: event.eventId,
        eventId: event.eventId,
        eventName: event.eventName,
        eventDate: event.eventDate,
        eventVenue: event.eventVenue,
        ticketsSold: event.ticketsSold,
        revenue: event.revenue,
        isOwner: event.isOwner,
        ownerId: event.ownerId,
        
      }))
      
      setEvents(eventsArray)
      console.log("[ScannerScreen] Loaded downloaded events:", eventsArray.length)
    } catch (error) {
      console.error("[ScannerScreen] Error loading events:", error)
    }
  }

  const getLocalIpAddress = async () => {
    try {
      const ip = await Network.getIpAddressAsync()
      console.log("[ScannerScreen] Local IP:", ip)
    } catch (error) {
      console.error("[ScannerScreen] Error getting IP:", error)
    }
  }

  const startServer = async () => {
    if (!selectedEvent) {
      Alert.alert("Error", "Please select an event first")
      return
    }

    try {
      setIsLoading(true)
      console.log("[ScannerScreen] Starting server for event:", selectedEvent.eventName)

      const result = await ScannerServer.start({
        eventId: selectedEvent.id,
        eventName: selectedEvent.eventName,
        userName: user?.fullName || user?.username || "Admin",
        userUid: user?.uid || "",
      })

      setIsServerRunning(true)
      setServerUrl(result.url)
      
      Alert.alert(
        "Server Started",
        `Scanner server is now running!\n\nURL: ${result.url}\n\nShare this URL with your scanning team.`,
        [
          { text: "OK" },
          { 
            text: "Share URL", 
            onPress: () => shareServerUrl(result.url)
          }
        ]
      )
    } catch (error: any) {
      console.error("[ScannerScreen] Server start error:", error)
      Alert.alert("Error", error.message || "Failed to start server")
    } finally {
      setIsLoading(false)
    }
  }

  const stopServer = async () => {
    try {
      setIsLoading(true)
      await ScannerServer.stop()
      setIsServerRunning(false)
      setServerUrl("")
      
      Alert.alert(
        "Server Stopped",
        `Total Scans: ${stats.totalScans}\nSuccessful: ${stats.successfulScans}\nFailed: ${stats.failedScans}`
      )
      
      // Reset stats
      setStats({
        totalScans: 0,
        successfulScans: 0,
        failedScans: 0,
        activeScannersCount: 0,
      })
    } catch (error) {
      Alert.alert("Error", "Failed to stop server")
    } finally {
      setIsLoading(false)
    }
  }

  const shareServerUrl = async (url: string) => {
    try {
      await Share.share({
        message: `Join the scanning team for ${selectedEvent?.eventName}!\n\nScanner URL: ${url}\n\nOpen this URL on any device connected to the same WiFi network.`,
        title: "Scanner Server URL",
      })
    } catch (error) {
      console.error("[ScannerScreen] Share error:", error)
    }
  }

  const openAdminPanel = () => {
    if (serverUrl) {
      const adminUrl = serverUrl.replace('/scanner', '/admin')
      // In a real implementation, you'd open this in a WebView or browser
      Alert.alert(
        "Admin Panel",
        `Open this URL in a browser:\n\n${adminUrl}`,
        [
          { text: "OK" },
          {
            text: "Copy URL",
            onPress: () => {
              // Copy to clipboard
              console.log("Admin URL:", adminUrl)
            }
          }
        ]
      )
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Scanner Hub</Text>
        <Text style={styles.subtitle}>Start a local scanning server</Text>
      </View>

      {events.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📥</Text>
          <Text style={styles.emptyText}>No events downloaded</Text>
          <Text style={styles.emptySubtext}>
            Download an event registry first to start the scanner server
          </Text>
        </View>
      ) : (
        <>
          {/* Event Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Event</Text>
            {events.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={[
                  styles.eventOption, 
                  selectedEvent?.id === event.id && styles.eventOptionSelected
                ]}
                onPress={() => !isServerRunning && setSelectedEvent(event)}
                disabled={isServerRunning}
              >
                <View style={styles.eventOptionContent}>
                  <Text style={styles.eventOptionText}>{event.eventName}</Text>
                  <Text style={styles.eventOptionMeta}>
                    {event.eventVenue || "No venue"}
                  </Text>
                </View>
                {selectedEvent?.id === event.id && (
                  <Text style={styles.eventOptionCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Server Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Server Status</Text>
            <View style={styles.statusCard}>
              <View style={[
                styles.statusIndicator, 
                isServerRunning && styles.statusActive
              ]} />
              <View style={styles.statusContent}>
                <Text style={styles.statusTitle}>
                  {isServerRunning ? "Running" : "Stopped"}
                </Text>
                {isServerRunning && serverUrl && (
                  <Text style={styles.statusUrl}>{serverUrl}</Text>
                )}
                {!isServerRunning && (
                  <Text style={styles.statusSubtitle}>Server is not running</Text>
                )}
              </View>
            </View>
          </View>

          {/* Live Stats */}
          {isServerRunning && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Live Statistics</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.totalScans}</Text>
                  <Text style={styles.statLabel}>Total Scans</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: COLORS.success }]}>
                    {stats.successfulScans}
                  </Text>
                  <Text style={styles.statLabel}>Successful</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: COLORS.error }]}>
                    {stats.failedScans}
                  </Text>
                  <Text style={styles.statLabel}>Failed</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: COLORS.info }]}>
                    {stats.activeScannersCount}
                  </Text>
                  <Text style={styles.statLabel}>Active Scanners</Text>
                </View>
              </View>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            {!isServerRunning ? (
              <TouchableOpacity 
                style={[
                  styles.button,
                  !selectedEvent && styles.buttonDisabled
                ]} 
                onPress={startServer} 
                disabled={isLoading || !selectedEvent}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Text style={styles.buttonIcon}>🚀</Text>
                    <Text style={styles.buttonText}>Start Server</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity 
                  style={[styles.button, styles.buttonSecondary]} 
                  onPress={() => shareServerUrl(serverUrl)}
                >
                  <Text style={styles.buttonIcon}>📤</Text>
                  <Text style={[styles.buttonText, { color: COLORS.primary }]}>
                    Share Scanner URL
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.button, styles.buttonSecondary]} 
                  onPress={openAdminPanel}
                >
                  <Text style={styles.buttonIcon}>👁️</Text>
                  <Text style={[styles.buttonText, { color: COLORS.primary }]}>
                    Open Admin Panel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.button, styles.buttonDanger]} 
                  onPress={stopServer} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <>
                      <Text style={styles.buttonIcon}>⏹️</Text>
                      <Text style={styles.buttonText}>Stop Server</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Info Card */}
          {selectedEvent && !isServerRunning && (
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoText}>
                The scanner server will be accessible to any device on the same WiFi network. 
                Make sure all scanning devices are connected to the same network.
              </Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  } as ViewStyle,
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingBottom: SPACING.xxl,
  } as ViewStyle,
  header: {
    marginBottom: SPACING.xl,
  } as ViewStyle,
  title: {
    ...(TYPOGRAPHY.heading2 as TextStyle),
    color: COLORS.foreground,
    fontSize: 28,
    fontWeight: "bold",
  } as TextStyle,
  subtitle: {
    ...(TYPOGRAPHY.body as TextStyle),
    color: COLORS.mutedForeground,
    marginTop: SPACING.xs,
  } as TextStyle,
  section: {
    marginBottom: SPACING.lg,
  } as ViewStyle,
  sectionTitle: {
    ...(TYPOGRAPHY.label as TextStyle),
    color: COLORS.foreground,
    marginBottom: SPACING.md,
    fontSize: 16,
    fontWeight: "600",
  } as TextStyle,
  eventOption: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.muted,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  } as ViewStyle,
  eventOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "10",
  } as ViewStyle,
  eventOptionContent: {
    flex: 1,
  } as ViewStyle,
  eventOptionText: {
    ...(TYPOGRAPHY.body as TextStyle),
    color: COLORS.foreground,
    fontWeight: "600",
    marginBottom: 2,
  } as TextStyle,
  eventOptionMeta: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.mutedForeground,
    fontSize: 12,
  } as TextStyle,
  eventOptionCheck: {
    fontSize: 24,
    color: COLORS.primary,
  } as TextStyle,
  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.muted,
  } as ViewStyle,
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.error,
    marginRight: SPACING.md,
  } as ViewStyle,
  statusActive: {
    backgroundColor: COLORS.success,
  } as ViewStyle,
  statusContent: {
    flex: 1,
  } as ViewStyle,
  statusTitle: {
    ...(TYPOGRAPHY.label as TextStyle),
    color: COLORS.foreground,
    fontWeight: "600",
    marginBottom: 2,
  } as TextStyle,
  statusUrl: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.primary,
    fontFamily: "monospace",
  } as TextStyle,
  statusSubtitle: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.mutedForeground,
  } as TextStyle,
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  } as ViewStyle,
  statItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.muted,
  } as ViewStyle,
  statValue: {
    ...(TYPOGRAPHY.heading2 as TextStyle),
    color: COLORS.primary,
    fontSize: 32,
    fontWeight: "bold",
  } as TextStyle,
  statLabel: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.mutedForeground,
    textAlign: "center",
    marginTop: SPACING.xs,
  } as TextStyle,
  actions: {
    marginTop: SPACING.lg,
  } as ViewStyle,
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    flexDirection: "row",
    gap: SPACING.sm,
  } as ViewStyle,
  buttonSecondary: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
  } as ViewStyle,
  buttonDanger: {
    backgroundColor: COLORS.error,
  } as ViewStyle,
  buttonDisabled: {
    opacity: 0.5,
  } as ViewStyle,
  buttonIcon: {
    fontSize: 20,
  } as TextStyle,
  buttonText: {
    ...(TYPOGRAPHY.label as TextStyle),
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 16,
  } as TextStyle,
  infoCard: {
    backgroundColor: COLORS.info + "15",
    borderRadius: 12,
    padding: SPACING.md,
    flexDirection: "row",
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.info + "30",
  } as ViewStyle,
  infoIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  } as TextStyle,
  infoText: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.foreground,
    flex: 1,
    lineHeight: 18,
  } as TextStyle,
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: SPACING.xxl,
    paddingVertical: SPACING.xxl,
  } as ViewStyle,
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  } as TextStyle,
  emptyText: {
    ...(TYPOGRAPHY.heading3 as TextStyle),
    color: COLORS.foreground,
    textAlign: "center",
    marginBottom: SPACING.sm,
  } as TextStyle,
  emptySubtext: {
    ...(TYPOGRAPHY.body as TextStyle),
    color: COLORS.mutedForeground,
    textAlign: "center",
    maxWidth: "80%",
  } as TextStyle,
})