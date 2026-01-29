import { getRealm } from '@/database/realm'
import Realm from 'realm'
import * as Network from 'expo-network'
// @ts-ignore
import httpBridge from 'react-native-http-bridge'

interface ServerConfig {
  eventId: string
  eventName: string
  userName: string
  userUid: string
}

interface ScannerInfo {
  id: string
  name: string
  connectedAt: string
  lastScanAt: string | null
  totalScans: number
}

interface ScanLog {
  ticketId: string
  scannerId: string
  scannerName: string
  timestamp: string
  status: 'success' | 'failed' | 'already_verified'
  errorMessage?: string
}

class ScannerServerService {
  private isRunning: boolean = false
  private config: ServerConfig | null = null
  private activeScanners: Map<string, ScannerInfo> = new Map()
  private scanLogs: ScanLog[] = []
  private adminConnections: Set<any> = new Set()
  private localIp: string = ''
  private readonly PORT = 8080

  /**
   * Start the HTTP server
   */
  async start(config: ServerConfig): Promise<{ url: string; port: number }> {
    if (this.isRunning) {
      throw new Error('Server is already running')
    }

    this.config = config

    try {
      // Get local IP address
      this.localIp = await this.getLocalIpAddress()
      
      console.log('[ScannerServer] Starting server on', `${this.localIp}:${this.PORT}`)
      
      // Start HTTP Bridge server
      httpBridge.start(this.PORT, 'http_service', (request: any) => {
        this.handleRequest(request)
      })

      this.isRunning = true
      
      return {
        url: `http://${this.localIp}:${this.PORT}/scanner`,
        port: this.PORT,
      }
    } catch (error) {
      console.error('[ScannerServer] Start error:', error)
      throw error
    }
  }

  /**
   * Stop the HTTP server
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return
    }

    try {
      // Stop HTTP Bridge
      httpBridge.stop()

      // Clear all connections and data
      this.adminConnections.clear()
      this.activeScanners.clear()
      this.scanLogs = []
      this.config = null
      this.isRunning = false

      console.log('[ScannerServer] Server stopped')
    } catch (error) {
      console.error('[ScannerServer] Stop error:', error)
      throw error
    }
  }

  /**
   * Get local IP address
   */
  private async getLocalIpAddress(): Promise<string> {
    try {
      const ip = await Network.getIpAddressAsync()
      return ip
    } catch (error) {
      console.error('[ScannerServer] IP detection error:', error)
      // Fallback to localhost
      return '127.0.0.1'
    }
  }

  /**
   * Main request handler - routes all HTTP requests
   */
  private handleRequest(request: any): void {
    const { url, type, postData } = request
    
    console.log(`[ScannerServer] ${type} ${url}`)

    try {
      // Route handling
      if (type === 'GET') {
        if (url === '/scanner' || url === '/scanner.html') {
          this.serveStaticFile(request, 'scanner.html')
        } else if (url === '/admin' || url === '/admin.html') {
          this.serveStaticFile(request, 'admin.html')
        } else if (url === '/api/admin/stats') {
          this.handleGetStats(request)
        } else if (url.startsWith('/ws/admin')) {
          // WebSocket upgrade simulation via long polling
          this.handleAdminWebSocket(request)
        } else {
          this.sendResponse(request, 404, 'Not Found', { 'Content-Type': 'text/plain' })
        }
      } else if (type === 'POST') {
        if (url === '/api/scanner/connect') {
          this.handleScannerConnect(request, postData)
        } else if (url === '/api/scan/verify') {
          this.handleScanVerify(request, postData)
        } else {
          this.sendResponse(request, 404, 'Not Found', { 'Content-Type': 'text/plain' })
        }
      } else {
        this.sendResponse(request, 405, 'Method Not Allowed', { 'Content-Type': 'text/plain' })
      }
    } catch (error) {
      console.error('[ScannerServer] Request handler error:', error)
      this.sendResponse(
        request,
        500,
        JSON.stringify({ error: 'Internal Server Error' }),
        { 'Content-Type': 'application/json' }
      )
    }
  }

  /**
   * Serve static HTML files
   */
  private serveStaticFile(request: any, filename: string): void {
    // In React Native, we need to read from assets
    // The HTML content will be imported as strings
    const htmlContent = this.getHtmlContent(filename)
    
    this.sendResponse(request, 200, htmlContent, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    })
  }

  /**
   * Get HTML content for static files
   * These files should be imported at the top of the file
   */
  private getHtmlContent(filename: string): string {
    // Import the HTML files as raw strings
    // You'll need to use a loader or import them as text
    // For now, returning a placeholder - we'll fix this in the final implementation
    if (filename === 'scanner.html') {
      return require('@/assets/scanner/scanner.html')
    } else if (filename === 'admin.html') {
      return require('@/assets/scanner/admin.html')
    }
    return '<html><body>File not found</body></html>'
  }

  /**
   * Handle scanner connection
   */
  private handleScannerConnect(request: any, postData: string): void {
    try {
      const { scannerName } = JSON.parse(postData || '{}')

      if (!scannerName) {
        this.sendResponse(
          request,
          400,
          JSON.stringify({ error: 'Scanner name is required' }),
          { 'Content-Type': 'application/json' }
        )
        return
      }

      const scannerId = this.generateScannerId()
      
      this.activeScanners.set(scannerId, {
        id: scannerId,
        name: scannerName,
        connectedAt: new Date().toISOString(),
        lastScanAt: null,
        totalScans: 0,
      })

      // Broadcast to admin connections
      this.broadcastToAdmin({
        type: 'scanner_connected',
        data: { scannerId, scannerName },
      })

      console.log('[ScannerServer] Scanner connected:', scannerName)
      
      this.sendResponse(
        request,
        200,
        JSON.stringify({ scannerId }),
        { 'Content-Type': 'application/json' }
      )
    } catch (error) {
      console.error('[ScannerServer] Scanner connect error:', error)
      this.sendResponse(
        request,
        400,
        JSON.stringify({ error: 'Invalid request data' }),
        { 'Content-Type': 'application/json' }
      )
    }
  }

  /**
   * Handle ticket verification
   */
  private handleScanVerify(request: any, postData: string): void {
    try {
      const { ticketId, scannerId } = JSON.parse(postData || '{}')

      if (!ticketId || !scannerId) {
        this.sendResponse(
          request,
          400,
          JSON.stringify({ error: 'Ticket ID and Scanner ID are required' }),
          { 'Content-Type': 'application/json' }
        )
        return
      }

      const result = this.verifyTicketSync(ticketId, scannerId)
      
      this.sendResponse(
        request,
        200,
        JSON.stringify(result),
        { 'Content-Type': 'application/json' }
      )
    } catch (error) {
      console.error('[ScannerServer] Scan verify error:', error)
      this.sendResponse(
        request,
        500,
        JSON.stringify({
          success: false,
          status: 'failed',
          message: 'Error processing scan',
        }),
        { 'Content-Type': 'application/json' }
      )
    }
  }

  /**
   * Verify ticket synchronously (called from request handler)
   */
  private verifyTicketSync(ticketId: string, scannerId: string): {
    success: boolean
    status: 'success' | 'failed' | 'already_verified'
    message: string
    ticketData?: any
  } {
    if (!this.config) {
      return {
        success: false,
        status: 'failed',
        message: 'Server not configured',
      }
    }

    try {
      const realm = getRealm()
      const scanner = this.activeScanners.get(scannerId)

      // Find ticket in Realm
      const ticket = realm
        .objects('Ticket')
        .filtered('ticketId == $0 AND eventId == $1', ticketId, this.config.eventId)[0] as any

      if (!ticket) {
        // Log failed scan
        this.logScan({
          ticketId,
          scannerId,
          scannerName: scanner?.name || 'Unknown',
          timestamp: new Date().toISOString(),
          status: 'failed',
          errorMessage: 'Ticket not found',
        })

        this.broadcastToAdmin({
          type: 'scan_failed',
          data: { ticketId, scannerId, reason: 'Ticket not found' },
        })

        return {
          success: false,
          status: 'failed',
          message: 'Ticket not found for this event',
        }
      }

      // Check if already verified
      if (ticket.verified) {
        this.logScan({
          ticketId,
          scannerId,
          scannerName: scanner?.name || 'Unknown',
          timestamp: new Date().toISOString(),
          status: 'already_verified',
        })

        this.broadcastToAdmin({
          type: 'scan_duplicate',
          data: { ticketId, scannerId, attendeeName: ticket.attendeeName },
        })

        return {
          success: false,
          status: 'already_verified',
          message: 'Ticket already verified',
          ticketData: {
            attendeeName: ticket.attendeeName,
            ticketType: ticket.ticketType,
            verifiedAt: ticket.verificationDate + ' ' + ticket.verificationTime,
          },
        }
      }

      // Verify ticket
      realm.write(() => {
        ticket.verified = true
        ticket.verificationDate = new Date().toLocaleDateString()
        ticket.verificationTime = new Date().toLocaleTimeString()
        ticket.scannedOffline = true
        ticket.scannerName = scanner?.name || 'Unknown'
        ticket.scanTimestamp = new Date().toISOString()
        ticket.syncedToServer = false
      })

      // Update scanner stats
      if (scanner) {
        scanner.lastScanAt = new Date().toISOString()
        scanner.totalScans++
      }

      // Log successful scan
      this.logScan({
        ticketId,
        scannerId,
        scannerName: scanner?.name || 'Unknown',
        timestamp: new Date().toISOString(),
        status: 'success',
      })

      // Log to ScanLog collection
      realm.write(() => {
        realm.create('ScanLog', {
          _id: new Realm.BSON.ObjectId(),
          ticketId,
          eventId: this.config!.eventId,
          timestamp: new Date().toISOString(),
          scannerName: scanner?.name || 'Unknown',
          scannerUid: this.config!.userUid,
          latency: 0,
          status: 'success',
          isOfflineScan: true,
          syncedToServer: false,
        })
      })

      this.broadcastToAdmin({
        type: 'scan_success',
        data: {
          ticketId,
          scannerId,
          attendeeName: ticket.attendeeName,
          ticketType: ticket.ticketType,
        },
      })

      console.log('[ScannerServer] Ticket verified:', ticketId)

      return {
        success: true,
        status: 'success',
        message: 'Ticket verified successfully',
        ticketData: {
          attendeeName: ticket.attendeeName,
          attendeeEmail: ticket.attendeeEmail,
          ticketType: ticket.ticketType,
          ticketReference: ticket.ticketReference,
        },
      }
    } catch (error) {
      console.error('[ScannerServer] Verify error:', error)
      
      this.logScan({
        ticketId,
        scannerId,
        scannerName: this.activeScanners.get(scannerId)?.name || 'Unknown',
        timestamp: new Date().toISOString(),
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      })

      return {
        success: false,
        status: 'failed',
        message: 'Error verifying ticket',
      }
    }
  }

  /**
   * Handle admin stats request
   */
  private handleGetStats(request: any): void {
    const data = this.getAdminData()
    
    this.sendResponse(
      request,
      200,
      JSON.stringify(data),
      { 'Content-Type': 'application/json' }
    )
  }

  /**
   * Handle admin WebSocket connection (via long polling)
   */
  private handleAdminWebSocket(request: any): void {
    // Store connection for broadcasting
    this.adminConnections.add(request)
    
    // Send initial data
    const data = this.getAdminData()
    this.sendResponse(
      request,
      200,
      JSON.stringify(data),
      { 'Content-Type': 'application/json' }
    )
  }

  /**
   * Get admin panel data
   */
  getAdminData() {
    return {
      event: {
        id: this.config?.eventId,
        name: this.config?.eventName,
      },
      scanners: Array.from(this.activeScanners.values()),
      recentScans: this.scanLogs.slice(-50).reverse(), // Last 50 scans
      stats: this.getStats(),
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    const totalScans = this.scanLogs.length
    const successfulScans = this.scanLogs.filter(log => log.status === 'success').length
    const failedScans = this.scanLogs.filter(log => log.status === 'failed').length

    return {
      totalScans,
      successfulScans,
      failedScans,
      activeScannersCount: this.activeScanners.size,
    }
  }

  /**
   * Log a scan
   */
  private logScan(log: ScanLog): void {
    this.scanLogs.push(log)
    // Keep only last 1000 logs in memory
    if (this.scanLogs.length > 1000) {
      this.scanLogs.shift()
    }
  }

  /**
   * Broadcast message to admin connections
   */
  private broadcastToAdmin(message: any): void {
    // In a real WebSocket implementation, this would send to all connected clients
    // For now, we'll rely on polling from the admin panel
    console.log('[ScannerServer] Broadcast:', message.type)
  }

  /**
   * Generate unique scanner ID
   */
  private generateScannerId(): string {
    return `scanner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Send HTTP response
   */
  private sendResponse(
    request: any,
    code: number,
    body: string,
    headers: Record<string, string> = {}
  ): void {
    httpBridge.respond(request.requestId, code, 'text/html', body)
  }
}

export const ScannerServer = new ScannerServerService()