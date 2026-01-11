import os from "os"

/**
 * Get the local IP address of the device
 * Used for displaying accessible server URLs on the LAN
 */
export const getDeviceIP = (): string => {
  try {
    const interfaces = os.networkInterfaces()
    for (const name of Object.keys(interfaces)) {
      const iface = interfaces[name]
      if (iface) {
        for (const addr of iface) {
          // Skip internal and non-IPv4 addresses
          if (addr.family === "IPv4" && !addr.internal) {
            return addr.address
          }
        }
      }
    }
  } catch (error) {
    console.error("[Network] Error getting device IP:", error)
  }
  return "localhost"
}

/**
 * Check if a port is available for binding
 */
export const isPortAvailable = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = require("net").createServer()

    server.once("error", () => {
      resolve(false)
    })

    server.once("listening", () => {
      server.close()
      resolve(true)
    })

    server.listen(port)
  })
}
