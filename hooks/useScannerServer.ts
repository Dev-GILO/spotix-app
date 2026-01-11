"use client"

import { useState, useCallback } from "react"
import ScannerServer from "@/server/scanner-server"

export const useScannerServer = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serverInstance, setServerInstance] = useState<ScannerServer | null>(null)

  const start = useCallback(async (eventId: string, port = 8080) => {
    try {
      setError(null)
      const server = new ScannerServer({ port, eventId })
      await server.start()
      setServerInstance(server)
      setIsRunning(true)
      return server
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [])

  const stop = useCallback(async () => {
    try {
      if (serverInstance) {
        await serverInstance.stop()
        setServerInstance(null)
        setIsRunning(false)
      }
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [serverInstance])

  const validateTicket = useCallback(
    (ticketId: string) => {
      if (!serverInstance) {
        throw new Error("Server not running")
      }
      return serverInstance.validateTicket(ticketId)
    },
    [serverInstance],
  )

  return {
    isRunning,
    error,
    server: serverInstance,
    start,
    stop,
    validateTicket,
  }
}
