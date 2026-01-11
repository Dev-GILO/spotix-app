"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, FlatList, ViewStyle, TextStyle } from "react-native"
import Realm from "realm"
import { useAuth } from "@/hooks/useAuth"
import ApiService from "@/services/api"
import { getRealm } from "@/database/realm"
import { COLORS, SPACING, TYPOGRAPHY } from "@/theme/colors"
import type { Event } from "@/types"

export const RegistryScreen = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [downloadingEventId, setDownloadingEventId] = useState<string | null>(null)

  useEffect(() => {
    loadLocalEvents()
  }, [])

  const loadLocalEvents = () => {
    try {
      const realm = getRealm()
      const localEvents = realm.objects("Event") as any
      setEvents(Array.from(localEvents))
    } catch (error) {
      console.error("[RegistryScreen] Error loading local events:", error)
    }
  }

  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      const response = await ApiService.getEvents()
      console.log("[RegistryScreen] Events fetched:", response)
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to fetch events")
    } finally {
      setIsLoading(false)
    }
  }

  const downloadRegistry = async (eventId: string) => {
    try {
      setDownloadingEventId(eventId)
      const response = await ApiService.downloadRegistry(eventId)

      const realm = getRealm()
      realm.write(() => {
        // Update or create event
        realm.create(
          "Event",
          {
            eventId: response.eventId,
            eventName: response.eventName,
            date: new Date().toISOString(),
            totalTickets: response.totalTickets,
            downloadedAt: new Date().toISOString(),
          },
          Realm.UpdateMode.Modified,
        )

        // Save tickets
        response.tickets.forEach((ticket: any) => {
          realm.create(
            "Ticket",
            {
              ticketId: ticket.ticketId,
              eventId: ticket.eventId,
              ticketType: ticket.ticketType,
              purchaseDate: ticket.purchaseDate,
              purchaseTime: ticket.purchaseTime,
              scanned: false,
            },
            Realm.UpdateMode.Modified,
          )
        })
      })

      Alert.alert("Success", "Registry downloaded successfully")
      loadLocalEvents()
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to download registry")
    } finally {
      setDownloadingEventId(null)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Download Registry</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchEvents} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <Text style={styles.refreshButtonText}>Fetch Events</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={events}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            isDownloading={downloadingEventId === item.eventId}
            onDownload={() => downloadRegistry(item.eventId)}
          />
        )}
        keyExtractor={(item) => item.eventId}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No events available</Text>}
      />
    </View>
  )
}

const EventCard = ({
  event,
  isDownloading,
  onDownload,
}: {
  event: Event
  isDownloading: boolean
  onDownload: () => void
}) => (
  <View style={styles.card}>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{event.eventName}</Text>
      <Text style={styles.cardSubtitle}>{event.totalTickets} tickets</Text>
      {event.downloadedAt && (
        <Text style={styles.cardMeta}>Downloaded: {new Date(event.downloadedAt).toLocaleDateString()}</Text>
      )}
    </View>
    <TouchableOpacity
      style={[styles.downloadButton, isDownloading && styles.downloadButtonDisabled]}
      onPress={onDownload}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <ActivityIndicator color={COLORS.white} size="small" />
      ) : (
        <Text style={styles.downloadButtonText}>{event.downloadedAt ? "Update" : "Download"}</Text>
      )}
    </TouchableOpacity>
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
  } as TextStyle,
  list: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  } as ViewStyle,
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.muted,
  } as ViewStyle,
  cardContent: {
    flex: 1,
  } as ViewStyle,
  cardTitle: {
    ...(TYPOGRAPHY.label as TextStyle),
    color: COLORS.foreground,
    marginBottom: SPACING.xs,
  } as TextStyle,
  cardSubtitle: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.mutedForeground,
    marginBottom: SPACING.xs,
  } as TextStyle,
  cardMeta: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.success,
  } as TextStyle,
  downloadButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 6,
    minWidth: 80,
    alignItems: "center",
  } as ViewStyle,
  downloadButtonText: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.white,
    fontWeight: "600",
  } as TextStyle,
  downloadButtonDisabled: {
    opacity: 0.6,
  } as ViewStyle,
  emptyText: {
    ...(TYPOGRAPHY.body as TextStyle),
    color: COLORS.mutedForeground,
    textAlign: "center",
    marginVertical: SPACING.lg,
  } as TextStyle,
})