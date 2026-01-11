import { getRealm } from "@/database/realm"
import logger from "@/utils/logger"
import { getLocalIP } from "@/utils/validators"

interface LogsServerConfig {
  port: number
}

let logsServerInstance: any = null
let logsInactivityTimeout: ReturnType<typeof setTimeout> | null = null
const LOGS_INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes

export class LogsServer {
  private config: LogsServerConfig
  private lastActivity: number = Date.now()

  constructor(config: LogsServerConfig) {
    this.config = config
  }

  async start(): Promise<string> {
    try {
      logger.info(`Starting logs server on port ${this.config.port}`)
      const localIP = getLocalIP()

      logsServerInstance = {
        port: this.config.port,
        isRunning: true,
        localIP,
      }

      this.resetInactivityTimeout()
      return `Logs server started at http://${localIP}:${this.config.port}`
    } catch (error) {
      logger.error("Failed to start logs server:", error)
      throw error
    }
  }

  async stop(): Promise<void> {
    try {
      logger.info("Stopping logs server")

      if (logsInactivityTimeout) {
        clearTimeout(logsInactivityTimeout)
        logsInactivityTimeout = null
      }

      logsServerInstance = null
    } catch (error) {
      logger.error("Failed to stop logs server:", error)
      throw error
    }
  }

  getLogs() {
    try {
      const realm = getRealm()
      const logs = realm.objects("ScanLog") as any

      this.resetInactivityTimeout()

      return Array.from(logs).map((log: any) => ({
        ticketId: log.ticketId,
        eventId: log.eventId,
        timestamp: log.timestamp,
        scannerName: log.scannerName,
        latency: log.latency,
        status: log.status,
      }))
    } catch (error) {
      logger.error("Error retrieving logs:", error)
      return []
    }
  }

  getLogsForEvent(eventId: string) {
    try {
      const realm = getRealm()
      const logs = realm
        .objects("ScanLog")
        .filtered(`eventId == "${eventId}"`)
        .sorted("timestamp", true) as any

      this.resetInactivityTimeout()

      return Array.from(logs).map((log: any) => ({
        ticketId: log.ticketId,
        eventId: log.eventId,
        timestamp: log.timestamp,
        scannerName: log.scannerName,
        latency: log.latency,
        status: log.status,
      }))
    } catch (error) {
      logger.error(`Error retrieving logs for event ${eventId}:`, error)
      return []
    }
  }

  private resetInactivityTimeout() {
    this.lastActivity = Date.now()

    if (logsInactivityTimeout) {
      clearTimeout(logsInactivityTimeout)
    }

    logsInactivityTimeout = setTimeout(() => {
      logger.info("Logs server inactive for 30 minutes, stopping")
      this.stop().catch((err) =>
        logger.error("Error stopping logs server:", err)
      )
    }, LOGS_INACTIVITY_TIMEOUT)
  }

  getStatus() {
    return {
      isRunning: !!logsServerInstance,
      port: this.config.port,
      localIP: logsServerInstance?.localIP,
      lastActivity: this.lastActivity,
    }
  }
}

export default LogsServer
