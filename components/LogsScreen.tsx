"use client"

import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native"
import { useAuth } from "@/hooks/useAuth"
import { getRealm } from "@/database/realm"
import { COLORS, SPACING, TYPOGRAPHY } from "@/theme/colors"
import { formatTimestamp } from "@/utils/validators"

interface ScanLog {
  ticketId: string
  status: "valid" | "invalid"
  scannerName: string
  timestamp: string
  latency: number
}

export const LogsScreen = () => {
  const { user } = useAuth()
  const [logs, setLogs] = useState<ScanLog[]>([])
  const [isServerRunning, setIsServerRunning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverPort, setServerPort] = useState(4040)

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = () => {
    try {
      setIsLoading(true)
      const realm = getRealm()
      const scanLogs = realm.objects<ScanLog>("ScanLog")
      const sortedLogs = Array.from(scanLogs).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      setLogs(sortedLogs)
    } catch (error) {
      console.error("[LogsScreen] Error loading logs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const startLogsServer = async () => {
    try {
      setIsLoading(true)
      // Simulate starting server
      console.log("[LogsScreen] Starting logs server on port", serverPort)
      setIsServerRunning(true)
      Alert.alert("Success", `Logs server started on port ${serverPort}`)
    } catch (error) {
      Alert.alert("Error", "Failed to start logs server")
    } finally {
      setIsLoading(false)
    }
  }

  const stopLogsServer = async () => {
    try {
      setIsLoading(true)
      setIsServerRunning(false)
      Alert.alert("Info", "Logs server stopped")
    } catch (error) {
      Alert.alert("Error", "Failed to stop logs server")
    } finally {
      setIsLoading(false)
    }
  }

  const clearLogs = () => {
    Alert.alert("Clear Logs", "Are you sure you want to clear all logs?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          try {
            const realm = getRealm()
            realm.write(() => {
              const allLogs = realm.objects<ScanLog>("ScanLog")
              realm.delete(allLogs)
            })
            setLogs([])
            Alert.alert("Success", "Logs cleared")
          } catch (error) {
            Alert.alert("Error", "Failed to clear logs")
          }
        },
      },
    ])
  }

  const renderItem = ({ item }: { item: ScanLog }) => <LogEntry log={item} />

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Scan Logs</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadLogs} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={COLORS.primary} size="small" />
          ) : (
            <Text style={styles.refreshButtonText}>Refresh</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Server Status */}
      <View style={styles.serverStatus}>
        <View style={styles.serverStatusContent}>
          <View style={[styles.serverIndicator, isServerRunning && styles.serverIndicatorActive]} />
          <View>
            <Text style={styles.serverStatusTitle}>{isServerRunning ? "Running" : "Stopped"}</Text>
            <Text style={styles.serverStatusSubtitle}>
              {isServerRunning ? `Port ${serverPort}` : "Not running"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.serverButton, isServerRunning && styles.serverButtonStop]}
          onPress={isServerRunning ? stopLogsServer : startLogsServer}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.serverButtonText}>{isServerRunning ? "Stop" : "Start"}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Logs List */}
      <FlatList
        data={logs}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.ticketId}-${index}`}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No scan logs yet</Text>}
      />

      {/* Clear Button */}
      {logs.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={clearLogs}>
          <Text style={styles.clearButtonText}>Clear All Logs</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const LogEntry = ({ log }: { log: ScanLog }) => (
  <View style={styles.logEntry}>
    <View style={styles.logHeader}>
      <Text style={styles.logTicketId}>ID: {log.ticketId.substring(0, 8)}</Text>
      <View style={[styles.logStatus, log.status === "valid" && styles.logStatusValid]}>
        <Text
          style={[styles.logStatusText, log.status === "valid" && styles.logStatusTextValid]}
        >
          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
        </Text>
      </View>
    </View>
    <Text style={styles.logScanner}>{log.scannerName}</Text>
    <View style={styles.logFooter}>
      <Text style={styles.logTime}>{formatTimestamp(log.timestamp)}</Text>
      <Text style={styles.logLatency}>{log.latency}ms</Text>
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  } as ViewStyle,

  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.muted,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  } as ViewStyle,

  title: {
    ...(TYPOGRAPHY.heading2 as TextStyle),
    color: COLORS.foreground,
  } as TextStyle,

  refreshButton: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
  } as ViewStyle,

  refreshButtonText: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.primary,
    fontWeight: "600",
  } as TextStyle,

  serverStatus: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.muted,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  } as ViewStyle,

  serverStatusContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  } as ViewStyle,

  serverIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.error,
    marginRight: SPACING.md,
  } as ViewStyle,

  serverIndicatorActive: {
    backgroundColor: COLORS.success,
  } as ViewStyle,

  serverStatusTitle: {
    ...(TYPOGRAPHY.label as TextStyle),
    color: COLORS.foreground,
  } as TextStyle,

  serverStatusSubtitle: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.mutedForeground,
  } as TextStyle,

  serverButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 6,
  } as ViewStyle,

  serverButtonStop: {
    backgroundColor: COLORS.error,
  } as ViewStyle,

  serverButtonText: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.white,
    fontWeight: "600",
  } as TextStyle,

  list: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  } as ViewStyle,

  logEntry: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.muted,
  } as ViewStyle,

  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  } as ViewStyle,

  logTicketId: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.foreground,
    fontFamily: "monospace",
  } as TextStyle,

  logStatus: {
    backgroundColor: COLORS.errorLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  } as ViewStyle,

  logStatusValid: {
    backgroundColor: COLORS.successLight,
  } as ViewStyle,

  logStatusText: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.error,
    fontWeight: "600",
  } as TextStyle,

  logStatusTextValid: {
    color: COLORS.success,
  } as TextStyle,

  logScanner: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.mutedForeground,
    marginBottom: SPACING.xs,
  } as TextStyle,

  logFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  } as ViewStyle,

  logTime: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.mutedForeground,
    fontSize: 11,
  } as TextStyle,

  logLatency: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "600",
  } as TextStyle,

  emptyText: {
    ...(TYPOGRAPHY.body as TextStyle),
    color: COLORS.mutedForeground,
    textAlign: "center",
    marginVertical: SPACING.lg,
  } as TextStyle,

  clearButton: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: "center",
  } as ViewStyle,

  clearButtonText: {
    ...(TYPOGRAPHY.label as TextStyle),
    color: COLORS.white,
  } as TextStyle,
})
