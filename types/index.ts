// Authentication
export interface AuthCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: UserProfile
}

export interface UserProfile {
  id: string
  email: string
  name: string
  organization?: string
}

// Events & Registry
export interface Event {
  eventId: string
  eventName: string
  date: string
  location?: string
  totalTickets: number
  downloadedAt?: string
  syncedAt?: string
}

export interface Ticket {
  ticketId: string
  eventId: string
  ticketType: string
  purchaseDate: string
  purchaseTime: string
  scanned: boolean
  scannerName?: string
  scanTimestamp?: string
}

export interface ScanResult {
  ticketId: string
  timestamp: string
  scannerName: string
  latency: number
  status: "valid" | "invalid" | "already-used"
  eventId: string
}

// API Responses
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface RegistryDownloadResponse {
  eventId: string
  eventName: string
  tickets: Ticket[]
  totalTickets: number
}

export interface SyncPayload {
  eventId: string
  totalScanned: number
  firstScanTimestamp: string
  lastScanTimestamp: string
  scanResults: ScanResult[]
}

// Server Status
export interface ServerStatus {
  isRunning: boolean
  port: number
  localIP: string
  eventId?: string
  connectedClients: number
}
