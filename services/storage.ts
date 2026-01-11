import * as SecureStore from "expo-secure-store"

const AUTH_TOKEN_KEY = "spotix_auth_token"
const USER_PROFILE_KEY = "spotix_user_profile"

export class StorageService {
  async setAuthToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token)
    } catch (error) {
      console.error("[Storage] Failed to save auth token:", error)
    }
  }

  async getAuthToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(AUTH_TOKEN_KEY)
    } catch (error) {
      console.error("[Storage] Failed to retrieve auth token:", error)
      return null
    }
  }

  async clearAuthToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY)
    } catch (error) {
      console.error("[Storage] Failed to clear auth token:", error)
    }
  }

  async setUserProfile(profile: any): Promise<void> {
    try {
      await SecureStore.setItemAsync(USER_PROFILE_KEY, JSON.stringify(profile))
    } catch (error) {
      console.error("[Storage] Failed to save user profile:", error)
    }
  }

  async getUserProfile(): Promise<any | null> {
    try {
      const profile = await SecureStore.getItemAsync(USER_PROFILE_KEY)
      return profile ? JSON.parse(profile) : null
    } catch (error) {
      console.error("[Storage] Failed to retrieve user profile:", error)
      return null
    }
  }

  async clear(): Promise<void> {
    try {
      await this.clearAuthToken()
      await SecureStore.deleteItemAsync(USER_PROFILE_KEY)
    } catch (error) {
      console.error("[Storage] Failed to clear storage:", error)
    }
  }
}

export default new StorageService()
