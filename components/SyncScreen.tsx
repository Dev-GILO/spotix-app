"use client"

import { getRealm } from "@/database/realm"
import { useAuth } from "@/hooks/useAuth"
import ApiService from "@/services/api"
import { COLORS } from "@/theme/colors"
import { TYPOGRAPHY } from "@/theme/typography"
import type { Event } from "@/types"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"

export const SyncScreen = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [syncingEventId, setSyncingEventId] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = () => {
    try {
      setIsRefreshing(true)
      const realm = getRealm()
      const allEvents = realm.objects("Event") as any
      setEvents(Array.from(allEvents))
    } catch (error) {
      console.error("[SyncScreen] Error loading events:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const syncEvent = async (event: Event) => {
    try {
      setSyncingEventId(event.eventId)
      const realm = getRealm()

      const scannedTickets = realm
        .objects("Ticket")
        .filtered(`eventId == "${event.eventId}" AND scanned == true`) as any

      if (scannedTickets.length === 0) {
        Alert.alert("Info", "No scanned tickets to sync")
        return
      }

      const scanLogs = realm
        .objects("ScanLog")
        .filtered(`eventId == "${event.eventId}"`) as any

      const logs = Array.from(scanLogs) as Array<any>

      if (logs.length === 0) {
        Alert.alert("Info", "No scan logs available")
        return
      }

      const sortedLogs = (logs as Array<{ timestamp: string }>).sort(
        (a: any, b: any) =>
          new Date(a.timestamp).getTime() -
          new Date(b.timestamp).getTime()
      )

      const syncPayload = {
        eventId: event.eventId,
        totalScanned: scannedTickets.length,
        firstScanTimestamp:
          sortedLogs[0]?.timestamp || new Date().toISOString(),
        lastScanTimestamp:
          sortedLogs[sortedLogs.length - 1]?.timestamp ||
          new Date().toISOString(),
        scanResults: logs.map((log: any) => ({
          ticketId: log.ticketId,
          timestamp: log.timestamp,
          scannerName: log.scannerName,
          latency: log.latency,
          status: log.status,
          eventId: log.eventId,
        })),
      }

      const response = await ApiService.syncScans(syncPayload)

      realm.write(() => {
        const eventToUpdate = realm.objectForPrimaryKey(
          "Event",
          event.eventId
        )
        if (eventToUpdate) {
          eventToUpdate.syncedAt = response.syncedAt
        }
      })

      Alert.alert("Success", "Event synced successfully")
      loadEvents()
    } catch (error: any) {
      console.error("[SyncScreen] Sync error:", error)
      Alert.alert("Error", error.message || "Failed to sync event")
    } finally {
      setSyncingEventId(null)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sync Status</Text>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadEvents}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <Text style={styles.refreshButtonText}>Refresh</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={events}
        renderItem={({ item }) => (
          <SyncCard
            event={item}
            isSyncing={syncingEventId === item.eventId}
            onSync={() => syncEvent(item)}
          />
        )}
        keyExtractor={(item) => item.eventId}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No events available</Text>
        }
      />
    </View>
  )
}

const SyncCard = ({
  event,
  isSyncing,
  onSync,
}: {
  event: Event
  isSyncing: boolean
  onSync: () => void
}) => {
  const isSynced = !!event.syncedAt

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{event.eventName}</Text>

          <View
            style={[
              styles.statusBadge,
              isSynced && styles.statusBadgeSynced,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                isSynced && styles.statusBadgeTextSynced,
              ]}
            >
              {isSynced ? "Synced" : "Pending"}
            </Text>
          </View>
        </View>

        <Text style={styles.cardSubtitle}>
          {event.totalTickets} tickets
        </Text>

        {isSynced && (
          <Text style={styles.syncedDate}>
            Synced: {new Date(event.syncedAt!).toLocaleString()}
          </Text>
        )}
      </View>

      {!isSynced && (
        <TouchableOpacity
          style={styles.syncButton}
          onPress={onSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.syncButtonText}>Sync</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create<{
  container: ViewStyle
  header: ViewStyle
  title: TextStyle
  refreshButton: ViewStyle
  refreshButtonText: TextStyle
  list: ViewStyle
  card: ViewStyle
  cardContent: ViewStyle
  cardHeader: ViewStyle
  cardTitle: TextStyle
  cardSubtitle: TextStyle
  statusBadge: ViewStyle
  statusBadgeSynced: ViewStyle
  statusBadgeText: TextStyle
  statusBadgeTextSynced: TextStyle
  syncedDate: TextStyle
  syncButton: ViewStyle
  syncButtonText: TextStyle
  emptyText: TextStyle
}>({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    padding: 16,
  },

  title: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.foreground,
  },

  refreshButton: {
    marginTop: 12,
  },

  refreshButtonText: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
  },

  list: {
    paddingHorizontal: 16,
  },

  card: {
    backgroundColor: COLORS.surface, // ✅ FIXED
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },

  cardContent: {
    marginBottom: 8,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: {
    ...TYPOGRAPHY.label,
  },

  cardSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.muted,
  },

  statusBadge: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  statusBadgeSynced: {
    backgroundColor: COLORS.success,
  },

  statusBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
  },

  statusBadgeTextSynced: {
    color: COLORS.white,
  },

  syncedDate: {
    ...TYPOGRAPHY.caption,
    marginTop: 4,
    color: COLORS.muted,
  },

  syncButton: {
    marginTop: 12,
  },

  syncButtonText: {
    ...TYPOGRAPHY.label,
  },

  emptyText: {
    ...TYPOGRAPHY.body,
    textAlign: "center",
    marginTop: 40,
    color: COLORS.muted,
  },
})
