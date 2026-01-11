import type {
  AuthResponse,
  AuthCredentials,
  RegistryDownloadResponse,
  SyncPayload,
  Event,
} from "@/types"

const API_BASE_URL = "http://localhost:3001/v1"

export interface ApiError {
  message: string
  status: number
}

class ApiService {
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
  }

  clearToken() {
    this.token = null
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

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      })

      if (!response.ok) {
        let errorBody: any = {}
        try {
          errorBody = await response.json()
        } catch {
          // ignore JSON parse errors
        }

        throw <ApiError>{
          message: errorBody?.message || "API request failed",
          status: response.status,
        }
      }

      // Handle empty responses (e.g. 204 No Content)
      const text = await response.text()
      return text ? JSON.parse(text) : ({} as T)
    } catch (error) {
      if (typeof error === "object" && error !== null && "message" in error && "status" in error) {
        throw error as ApiError
      }

      throw <ApiError>{
        message: error instanceof Error ? error.message : "Unknown error",
        status: 0,
      }
    }
  }

  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  async getEvents(): Promise<Event[]> {
    return this.request<Event[]>("/events")
  }

  async downloadRegistry(eventId: string): Promise<RegistryDownloadResponse> {
    return this.request<RegistryDownloadResponse>(`/registry/${eventId}`)
  }

  async syncScans(payload: SyncPayload): Promise<{ syncedAt: string }> {
    return this.request<{ syncedAt: string }>("/registry/sync", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async validateTicket(
    ticketId: string,
    eventId: string
  ): Promise<{ status: string; scanner?: string }> {
    return this.request<{ status: string; scanner?: string }>(
      `/validate/${eventId}/${ticketId}`
    )
  }
}

export default new ApiService()
