"use client"

import { useState, useCallback } from "react"
import LogsServer from "@/server/logs-server"

export const useLogsServer = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serverInstance, setServerInstance] = useState<LogsServer | null>(null)

  const start = useCallback(async (port = 4040) => {
    try {
      setError(null)
      const server = new LogsServer({ port })
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

  const getLogs = useCallback(() => {
    if (!serverInstance) {
      throw new Error("Server not running")
    }
    return serverInstance.getLogs()
  }, [serverInstance])

  const getLogsForEvent = useCallback(
    (eventId: string) => {
      if (!serverInstance) {
        throw new Error("Server not running")
      }
      return serverInstance.getLogsForEvent(eventId)
    },
    [serverInstance],
  )

  return {
    isRunning,
    error,
    server: serverInstance,
    start,
    stop,
    getLogs,
    getLogsForEvent,
  }
}
