"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, FlatList, ViewStyle, TextStyle } from "react-native"
import Realm from "realm"
import { useAuth } from "@/hooks/useAuth"
import ApiService from "@/services/api"
import { getRealm } from "@/database/realm"
import { COLORS, SPACING, TYPOGRAPHY } from "@/theme/colors"
import type { Event } from "@/types"

interface LocalEvent extends Event {
  totalTickets?: number
  downloadedAt?: string
}

export const RegistryScreen = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState<LocalEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [downloadingEventId, setDownloadingEventId] = useState<string | null>(null)

  useEffect(() => {
    loadLocalEvents()
  }, [])

  const loadLocalEvents = () => {
    try {
      const realm = getRealm()
      const localEvents = realm.objects("Event") as any
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
        totalTickets: event.totalTickets || 0,
        downloadedAt: event.downloadedAt,
      }))
      
      setEvents(eventsArray)
      console.log("[RegistryScreen] Loaded local events:", eventsArray.length)
    } catch (error) {
      console.error("[RegistryScreen] Error loading local events:", error)
    }
  }

  const fetchEvents = async () => {
    if (!user) {
      Alert.alert("Error", "User not authenticated")
      return
    }

    try {
      setIsLoading(true)
      console.log("[RegistryScreen] Fetching events from API...")
      
      const response = await ApiService.getEvents()
      
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch events")
      }

      console.log("[RegistryScreen] Fetched events:", response.data.ownedEvents.length)

      // Store owned events in Realm
      const realm = getRealm()
      realm.write(() => {
        // Store each owned event
        response.data.ownedEvents.forEach((event) => {
          realm.create(
            "Event",
            {
              eventId: event.id,
              eventName: event.eventName,
              eventDate: event.eventDate,
              eventVenue: event.eventVenue || "",
              ticketsSold: event.ticketsSold || 0,
              revenue: event.revenue || 0,
              isOwner: event.isOwner,
              ownerId: event.ownerId,
              totalTickets: 0, // Will be updated when registry is downloaded
              downloadedAt: null,
              lastSyncedAt: new Date().toISOString(),
            },
            Realm.UpdateMode.Modified,
          )
        })
      })

      Alert.alert("Success", `Fetched ${response.data.ownedEvents.length} events`)
      loadLocalEvents()
    } catch (error: any) {
      console.error("[RegistryScreen] Fetch error:", error)
      Alert.alert("Error", error.message || "Failed to fetch events")
    } finally {
      setIsLoading(false)
    }
  }

  const downloadRegistry = async (eventId: string) => {
    if (!user) {
      Alert.alert("Error", "User not authenticated")
      return
    }

    try {
      setDownloadingEventId(eventId)
      console.log("[RegistryScreen] Downloading registry for event:", eventId)
      
      const response = await ApiService.getEventAttendees(eventId)
      
      if (!response.success) {
        throw new Error(response.message || "Failed to download registry")
      }

      const attendeesData = response.data.attendees
      const ticketIds = Object.keys(attendeesData)
      
      console.log("[RegistryScreen] Downloaded tickets:", ticketIds.length)

      const realm = getRealm()
      realm.write(() => {
        // Update event with download info
        realm.create(
          "Event",
          {
            eventId: response.data.eventId,
            eventName: response.data.eventName,
            eventDate: "", // Will keep existing value
            eventVenue: "",
            ticketsSold: 0,
            revenue: 0,
            isOwner: true,
            ownerId: user.uid,
            totalTickets: ticketIds.length,
            downloadedAt: new Date().toISOString(),
            lastSyncedAt: new Date().toISOString(),
          },
          Realm.UpdateMode.Modified,
        )

        // Delete existing tickets for this event first
        const existingTickets = realm
          .objects("Ticket")
          .filtered("eventId == $0", response.data.eventId)
        realm.delete(existingTickets)

        // Save all tickets
        ticketIds.forEach((ticketId) => {
          const attendee = attendeesData[ticketId]
          
          realm.create(
            "Ticket",
            {
              ticketId: ticketId,
              eventId: response.data.eventId,
              attendeeName: attendee.attendeeName,
              attendeeEmail: attendee.attendeeEmail,
              ticketType: attendee.ticketType,
              purchaseDate: attendee.purchaseDate,
              purchaseTime: attendee.purchaseTime,
              ticketReference: attendee.ticketReference,
              scannedOffline: false,
              scannerName: null,
              scanTimestamp: null,
              syncedToServer: true,
            },
            Realm.UpdateMode.Modified,
          )
        })
      })

      Alert.alert(
        "Success", 
        `Downloaded ${ticketIds.length} tickets for ${response.data.eventName}`
      )
      loadLocalEvents()
    } catch (error: any) {
      console.error("[RegistryScreen] Download error:", error)
      Alert.alert("Error", error.message || "Failed to download registry")
    } finally {
      setDownloadingEventId(null)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Download Registry</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={fetchEvents} 
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.primary} size="small" />
          ) : (
            <Text style={styles.refreshButtonText}>Fetch Events</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={events}
        scrollEnabled={true}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            isDownloading={downloadingEventId === item.id}
            onDownload={() => downloadRegistry(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No events available. Tap "Fetch Events" to load.
          </Text>
        }
      />
    </View>
  )
}

const EventCard = ({
  event,
  isDownloading,
  onDownload,
}: {
  event: LocalEvent
  isDownloading: boolean
  onDownload: () => void
}) => (
  <View style={styles.card}>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{event.eventName}</Text>
      <Text style={styles.cardSubtitle}>
        {event.eventVenue || "No venue"}
      </Text>
      {event.totalTickets !== undefined && event.totalTickets > 0 && (
        <Text style={styles.cardMeta}>
          {event.totalTickets} tickets downloaded
        </Text>
      )}
      {event.downloadedAt && (
        <Text style={styles.cardMetaSuccess}>
          Last downloaded: {new Date(event.downloadedAt).toLocaleString()}
        </Text>
      )}
    </View>
    <TouchableOpacity
      style={[
        styles.downloadButton, 
        isDownloading && styles.downloadButtonDisabled
      ]}
      onPress={onDownload}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <ActivityIndicator color={COLORS.white} size="small" />
      ) : (
        <Text style={styles.downloadButtonText}>
          {event.downloadedAt ? "Update" : "Download"}
        </Text>
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
    fontWeight: "600",
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  } as ViewStyle,
  cardContent: {
    flex: 1,
    marginRight: SPACING.sm,
  } as ViewStyle,
  cardTitle: {
    ...(TYPOGRAPHY.label as TextStyle),
    color: COLORS.foreground,
    marginBottom: SPACING.xs,
    fontWeight: "bold",
  } as TextStyle,
  cardSubtitle: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.mutedForeground,
    marginBottom: SPACING.xs,
  } as TextStyle,
  cardMeta: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.primary,
    marginBottom: 2,
  } as TextStyle,
  cardMetaSuccess: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.success,
    fontSize: 11,
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
    marginVertical: SPACING.xl,
  } as TextStyle,
})