export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): boolean => {
  return password.length >= 6
}

export const getLocalIP = (): string => {
  // This will be replaced with actual implementation
  // For now, returning a mock value
  return "192.168.1.100"
}

export const formatTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp)
    return date.toLocaleString()
  } catch {
    return timestamp
  }
}

export const calculateLatency = (startTime: number): number => {
  return Date.now() - startTime
}
