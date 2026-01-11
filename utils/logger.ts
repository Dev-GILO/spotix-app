export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

class Logger {
  private logs: Array<{ level: LogLevel; message: string; timestamp: string }> = []

  log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      level,
      message,
      timestamp,
      data,
    }

    console.log(`[${level}] ${message}`, data || "")
    this.logs.push({ level, message, timestamp })
  }

  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, message, data)
  }

  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data)
  }

  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data)
  }

  error(message: string, data?: any) {
    this.log(LogLevel.ERROR, message, data)
  }

  getLogs(): Array<{ level: LogLevel; message: string; timestamp: string }> {
    return [...this.logs]
  }

  clearLogs() {
    this.logs = []
  }
}

export default new Logger()
