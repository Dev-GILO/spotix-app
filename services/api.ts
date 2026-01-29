import type {
  Event,
} from "@/types"

// Update this to your actual backend URL
const API_BASE_URL = __DEV__ 
  ? "http://172.20.10.3:3000/v1" // Development
  : "https://your-production-api.com/v1" // Production

export interface ApiError {
  message: string
  status: number
  error?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  authToken: string
  user: {
    uid: string
    email: string
    username: string
    fullName: string
    emailVerified: boolean
    isBooker: boolean
    balance: number
    createdAt: string
    lastLogin: string
  }
  developer: string
}

export interface EventsResponse {
  success: boolean
  message: string
  data: {
    ownedEvents: Event[]
    collaboratedEvents: Event[]
  }
  developer: string
}

export interface AttendeesResponse {
  success: boolean
  message: string
  data: {
    eventId: string
    eventName: string
    attendees: {
      [ticketId: string]: {
        attendeeName: string
        attendeeEmail: string
        ticketType: string
        purchaseDate: string
        purchaseTime: string
        ticketReference: string
        verified: boolean
        verificationDate: string | null
        verificationTime: string | null
      }
    }
    totalAttendees: number
  }
  developer: string
}

export interface TicketDataResponse {
  success: boolean
  message: string
  data: {
    ticketId: string
    attendeeName: string
    attendeeEmail: string
    ticketType: string
    purchaseDate: string
    purchaseTime: string
    ticketReference: string
    verified: boolean
    verificationDate: string | null
    verificationTime: string | null
  }
  developer: string
}

class ApiService {
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
    console.log("[API] Token set:", token ? "***" : "null")
  }

  clearToken() {
    this.token = null
    console.log("[API] Token cleared")
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    const url = `${API_BASE_URL}${endpoint}`
    console.log(`[API] ${options.method || "GET"} ${url}`)

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      console.log(`[API] Response status: ${response.status}`)

      if (!response.ok) {
        let errorBody: any = {}
        try {
          errorBody = await response.json()
        } catch {
          // ignore JSON parse errors
        }

        const errorMessage = errorBody?.message || errorBody?.error || "API request failed"
        console.error("[API] Error:", errorMessage)

        throw {
          message: errorMessage,
          status: response.status,
          error: errorBody?.error || "Request failed",
        } as ApiError
      }

      // Handle empty responses (e.g. 204 No Content)
      const text = await response.text()
      const data = text ? JSON.parse(text) : ({} as T)
      
      console.log("[API] Success")
      return data
    } catch (error) {
      if (typeof error === "object" && error !== null && "message" in error && "status" in error) {
        throw error as ApiError
      }

      console.error("[API] Network error:", error)
      throw {
        message: error instanceof Error ? error.message : "Network error occurred",
        status: 0,
        error: "NetworkError",
      } as ApiError
    }
  }

  /**
   * Login to the system
   * POST /v1/auth with action: "login"
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>("/auth", {
      method: "POST",
      body: JSON.stringify({
        action: "login",
        email: credentials.email,
        password: credentials.password,
      }),
    })

    // Store the token immediately after successful login
    if (response.success && response.authToken) {
      this.setToken(response.authToken)
    }

    return response
  }

  /**
   * Get all events (owned + collaborated)
   * GET /v1/events
   */
  async getEvents(): Promise<EventsResponse> {
    return this.request<EventsResponse>("/events")
  }

  /**
   * Get attendees for a specific event
   * GET /v1/events/:eventId/attendees
   */
  async getEventAttendees(eventId: string): Promise<AttendeesResponse> {
    return this.request<AttendeesResponse>(`/events/${eventId}/attendees`)
  }

  /**
   * Get specific ticket data
   * GET /v1/events/:eventId/attendees/:ticketId
   */
  async getTicketData(eventId: string, ticketId: string): Promise<TicketDataResponse> {
    return this.request<TicketDataResponse>(`/events/${eventId}/attendees/${ticketId}`)
  }

  /**
   * Validate/verify a ticket (for offline verification)
   */
  async validateTicket(
    ticketId: string,
    eventId: string
  ): Promise<{ valid: boolean; ticket?: any; message?: string }> {
    try {
      const response = await this.getTicketData(eventId, ticketId)
      
      if (response.success) {
        return {
          valid: true,
          ticket: response.data,
        }
      }
      
      return {
        valid: false,
        message: response.message,
      }
    } catch (error) {
      const apiError = error as ApiError
      return {
        valid: false,
        message: apiError.message || "Ticket validation failed",
      }
    }
  }
}

export default new ApiService()