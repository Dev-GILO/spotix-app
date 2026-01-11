/**
 * Localized error and success messages
 */

export const MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: "Login successful",
    LOGIN_FAILED: "Login failed. Please check your credentials.",
    LOGOUT_SUCCESS: "Logged out successfully",
    SESSION_EXPIRED: "Your session has expired. Please login again.",
    INVALID_EMAIL: "Please enter a valid email address",
    PASSWORD_TOO_SHORT: "Password must be at least 6 characters",
  },
  REGISTRY: {
    DOWNLOAD_SUCCESS: "Registry downloaded successfully",
    DOWNLOAD_FAILED: "Failed to download registry",
    NO_EVENTS: "No events available to download",
    UPDATE_SUCCESS: "Registry updated successfully",
  },
  SCANNER: {
    SERVER_STARTED: "Scanner server started",
    SERVER_STOPPED: "Scanner server stopped",
    SERVER_FAILED: "Failed to start scanner server",
    NO_EVENTS_AVAILABLE: "No downloaded events available",
    SELECT_EVENT: "Please select an event first",
    TICKET_VALID: "Ticket is valid",
    TICKET_INVALID: "Ticket not found",
    TICKET_USED: "Ticket already scanned",
  },
  SYNC: {
    SYNC_SUCCESS: "Event synced successfully",
    SYNC_FAILED: "Failed to sync event",
    NO_SCANS: "No scanned tickets to sync",
    SYNC_COMPLETE: "Sync completed",
  },
  LOGS: {
    SERVER_STARTED: "Logs server started",
    SERVER_STOPPED: "Logs server stopped",
    LOGS_CLEARED: "Logs cleared successfully",
    CLEAR_CONFIRMATION: "Are you sure you want to clear all logs?",
  },
  NETWORK: {
    NO_INTERNET: "No internet connection",
    OFFLINE_MODE: "Operating in offline mode",
    SYNC_WHEN_ONLINE: "Changes will sync when online",
  },
}
