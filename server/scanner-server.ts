import { getRealm } from "@/database/realm"
import logger from "@/utils/logger"

interface ScannerServerConfig {
  port: number
  eventId: string
}

let serverInstance: any = null
let inactivityTimeout: ReturnType<typeof setTimeout> | null = null
const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes

export class ScannerServer {
  private config: ScannerServerConfig
  private connectedClients: Set<string> = new Set()
  private lastActivity: number = Date.now()

  constructor(config: ScannerServerConfig) {
    this.config = config
  }

  async start(): Promise<string> {
    try {
      logger.info(`Starting scanner server on port ${this.config.port}`)

      // In a real implementation, this would use Express or similar
      // For now, we'll implement the core validation logic
      serverInstance = {
        port: this.config.port,
        eventId: this.config.eventId,
        isRunning: true,
      }

      this.resetInactivityTimeout()
      return `Scanner server started on port ${this.config.port}`
    } catch (error) {
      logger.error("Failed to start scanner server:", error)
      throw error
    }
  }

  async stop(): Promise<void> {
    try {
      logger.info("Stopping scanner server")

      if (inactivityTimeout) {
        clearTimeout(inactivityTimeout)
        inactivityTimeout = null
      }

      serverInstance = null
      this.connectedClients.clear()
    } catch (error) {
      logger.error("Failed to stop scanner server:", error)
      throw error
    }
  }

  validateTicket(ticketId: string): {
    status: "valid" | "invalid" | "already-used"
    scanner?: string
    timestamp?: string
  } {
    try {
      const realm = getRealm()
      const ticket = realm.objectForPrimaryKey("Ticket", ticketId) as any

      if (!ticket) {
        logger.warn(`Ticket not found: ${ticketId}`)
        return { status: "invalid" }
      }

      if (ticket.scanned) {
        logger.warn(`Ticket already scanned: ${ticketId}`)
        return {
          status: "already-used",
          scanner: ticket.scannerName,
          timestamp: ticket.scanTimestamp,
        }
      }

      const startTime = Date.now()

      // Mark ticket as scanned
      realm.write(() => {
        ticket.scanned = true
        ticket.scanTimestamp = new Date().toISOString()
        ticket.scannerName = "Scanner-1" // Should come from client
      })

      const latency = Date.now() - startTime

      // Log the scan
      realm.write(() => {
        realm.create("ScanLog", {
          ticketId,
          eventId: this.config.eventId,
          timestamp: new Date().toISOString(),
          scannerName: "Scanner-1",
          latency,
          status: "valid",
        })
      })

      logger.info(`Ticket validated: ${ticketId}`)
      this.resetInactivityTimeout()

      return {
        status: "valid",
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      logger.error(`Error validating ticket ${ticketId}:`, error)
      return { status: "invalid" }
    }
  }

  private resetInactivityTimeout() {
    this.lastActivity = Date.now()

    if (inactivityTimeout) {
      clearTimeout(inactivityTimeout)
    }

    inactivityTimeout = setTimeout(() => {
      logger.info("Scanner server inactive for 30 minutes, stopping")
      this.stop().catch((err) =>
        logger.error("Error stopping scanner server:", err)
      )
    }, INACTIVITY_TIMEOUT)
  }

  getStatus() {
    return {
      isRunning: !!serverInstance,
      port: this.config.port,
      eventId: this.config.eventId,
      connectedClients: this.connectedClients.size,
      lastActivity: this.lastActivity,
    }
  }
}

export default ScannerServer
