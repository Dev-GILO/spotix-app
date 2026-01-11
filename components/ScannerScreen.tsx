"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator, ViewStyle, TextStyle } from "react-native"
import { useAuth } from "@/hooks/useAuth"
import { getRealm } from "@/database/realm"
import { COLORS, SPACING, TYPOGRAPHY } from "@/theme/colors"
import type { Event } from "@/types"

export const ScannerScreen = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [isServerRunning, setIsServerRunning] = useState(false)
  const [serverPort, setServerPort] = useState(8080)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadDownloadedEvents()
  }, [])

  const loadDownloadedEvents = () => {
    try {
      const realm = getRealm()
      const localEvents = realm.objects("Event").filtered("downloadedAt != nil") as any
      setEvents(Array.from(localEvents))
    } catch (error) {
      console.error("[ScannerScreen] Error loading events:", error)
    }
  }

  const startServer = async () => {
    if (!selectedEventId) {
      Alert.alert("Error", "Please select an event first")
      return
    }

    try {
      setIsLoading(true)
      // In real implementation, this would start the HTTP server
      console.log("[ScannerScreen] Starting server on port", serverPort, "for event", selectedEventId)
      setIsServerRunning(true)
      Alert.alert("Success", `Scanner server started on port ${serverPort}`)
    } catch (error) {
      Alert.alert("Error", "Failed to start server")
    } finally {
      setIsLoading(false)
    }
  }

  const stopServer = async () => {
    try {
      setIsLoading(true)
      setIsServerRunning(false)
      Alert.alert("Info", "Scanner server stopped")
    } catch (error) {
      Alert.alert("Error", "Failed to stop server")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Scanner Server</Text>
      </View>

      {events.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No downloaded events available</Text>
          <Text style={styles.emptySubtext}>Download a registry first to start scanning</Text>
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Event</Text>
            {events.map((event) => (
              <TouchableOpacity
                key={event.eventId}
                style={[styles.eventOption, selectedEventId === event.eventId && styles.eventOptionSelected]}
                onPress={() => !isServerRunning && setSelectedEventId(event.eventId)}
                disabled={isServerRunning}
              >
                <Text style={styles.eventOptionText}>{event.eventName}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Server Status</Text>
            <View style={styles.statusCard}>
              <View style={[styles.statusIndicator, isServerRunning && styles.statusActive]} />
              <View style={styles.statusContent}>
                <Text style={styles.statusTitle}>{isServerRunning ? "Running" : "Stopped"}</Text>
                <Text style={styles.statusSubtitle}>{isServerRunning ? `Port ${serverPort}` : "Not running"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            {!isServerRunning ? (
              <TouchableOpacity style={styles.button} onPress={startServer} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.buttonText}>Start Server</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={stopServer} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.buttonText}>Stop Server</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
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
  } as ViewStyle,
  header: {
    marginBottom: SPACING.lg,
  } as ViewStyle,
  title: {
    ...(TYPOGRAPHY.heading2 as TextStyle),
    color: COLORS.foreground,
  } as TextStyle,
  section: {
    marginBottom: SPACING.lg,
  } as ViewStyle,
  sectionTitle: {
    ...(TYPOGRAPHY.label as TextStyle),
    color: COLORS.foreground,
    marginBottom: SPACING.md,
  } as TextStyle,
  eventOption: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.muted,
  } as ViewStyle,
  eventOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(107, 47, 165, 0.05)",
  } as ViewStyle,
  eventOptionText: {
    ...(TYPOGRAPHY.body as TextStyle),
    color: COLORS.foreground,
  } as TextStyle,
  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.muted,
  } as ViewStyle,
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
  } as TextStyle,
  statusSubtitle: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.mutedForeground,
  } as TextStyle,
  actions: {
    marginTop: SPACING.lg,
  } as ViewStyle,
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: "center",
  } as ViewStyle,
  buttonDanger: {
    backgroundColor: COLORS.error,
  } as ViewStyle,
  buttonText: {
    ...(TYPOGRAPHY.label as TextStyle),
    color: COLORS.white,
  } as TextStyle,
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: SPACING.xxl,
  } as ViewStyle,
  emptyText: {
    ...(TYPOGRAPHY.body as TextStyle),
    color: COLORS.foreground,
    textAlign: "center",
    marginBottom: SPACING.sm,
  } as TextStyle,
  emptySubtext: {
    ...(TYPOGRAPHY.bodySmall as TextStyle),
    color: COLORS.mutedForeground,
    textAlign: "center",
  } as TextStyle,
})