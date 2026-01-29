/**
 * User Profile Type
 */
export interface UserProfile {
  uid: string
  email: string
  username: string
  fullName: string
  emailVerified: boolean
  isBooker: boolean
  balance: number
  createdAt: string
  lastLogin: string
}

/**
 * Event Type
 */
export interface Event {
  id: string
  eventName: string
  eventDate: string
  eventVenue?: string
  ticketsSold: number
  revenue: number
  isOwner: boolean
  ownerId: string
}

/**
 * Ticket/Attendee Type
 */
export interface Ticket {
  ticketId: string
  eventId: string
  attendeeName: string
  attendeeEmail: string
  ticketType: string
  purchaseDate: string
  purchaseTime: string
  ticketReference: string
}

/**
 * Scan Log Type
 */
export interface ScanLog {
  id: string
  ticketId: string
  eventId: string
  timestamp: string
  scannerName: string
  scannerUid: string
  status: "success" | "already_verified" | "not_found" | "error"
  errorMessage?: string
  isOfflineScan: boolean
  syncedToServer: boolean
}

/**
 * Registry Download Response (for offline mode)
 */
export interface RegistryDownloadResponse {
  eventId: string
  eventName: string
  tickets: Ticket[]
  downloadedAt: string
}

/**
 * Sync Payload (for syncing offline scans)
 */
export interface SyncPayload {
  eventId: string
  scans: Array<{
    ticketId: string
    timestamp: string
    scannerName: string
    scannerUid: string
  }>
}