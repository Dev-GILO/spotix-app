/**
 * Application Configuration
 * Change these values based on your local backend setup
 */

export const CONFIG = {
  // Backend API endpoint - change to match your local backend
  API_URL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001",

  // Local scanner server port
  SCANNER_PORT: Number.parseInt(process.env.EXPO_PUBLIC_SCANNER_PORT || "8080"),

  // Local logs server port
  LOGS_PORT: Number.parseInt(process.env.EXPO_PUBLIC_LOGS_PORT || "4040"),

  // App timeouts (ms)
  REQUEST_TIMEOUT: 30000,
  INACTIVITY_TIMEOUT: 30 * 60 * 1000, // 30 minutes

  // QR Code scanning
  QR_SCAN_DEBOUNCE: 500, // ms
}

export const API_ENDPOINTS = {
  LOGIN: "/login",
  EVENTS: "/events",
  REGISTRY: (eventId: string) => `/registry/${eventId}`,
  VALIDATE_TICKET: (eventId: string, ticketId: string) => `/validate/${eventId}/${ticketId}`,
  SYNC: "/registry/sync",
}
