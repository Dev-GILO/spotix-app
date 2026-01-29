"use client"

import React, { createContext, useState, useEffect, useCallback } from "react"
import ApiService from "@/services/api"
import StorageService from "@/services/storage"
import { initializeRealm, getRealm } from "@/database/realm"
import { UserProfileSchema } from "@/database/schema"
import type { UserProfile } from "@/types"

interface AuthContextType {
  user: UserProfile | null
  isLoading: boolean
  isInitializing: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUserData: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize on app load
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log("[Auth] Starting initialization...")
        
        // Initialize Realm database
        await initializeRealm()
        console.log("[Auth] Realm initialized")

        // Check for existing session in secure storage
        const token = await StorageService.getAuthToken()
        
        if (token) {
          console.log("[Auth] Found existing token")
          ApiService.setToken(token)
          
          // Try to get user from Realm first (offline capability)
          const realm = getRealm()
          const realmUser = realm.objects<UserProfileSchema>("UserProfile")[0]
          
          if (realmUser) {
            const userProfile: UserProfile = {
              uid: realmUser.uid,
              email: realmUser.email,
              username: realmUser.username,
              fullName: realmUser.fullName,
              emailVerified: realmUser.emailVerified,
              isBooker: realmUser.isBooker,
              balance: realmUser.balance,
              createdAt: realmUser.createdAt,
              lastLogin: realmUser.lastLogin,
            }
            
            setUser(userProfile)
            console.log("[Auth] Session restored from Realm")
          }
        } else {
          console.log("[Auth] No existing session found")
        }
      } catch (err) {
        console.error("[Auth] Initialization error:", err)
      } finally {
        setIsInitializing(false)
      }
    }

    initialize()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("[Auth] Attempting login...")
      const response = await ApiService.login({ email, password })

      if (!response.success) {
        throw new Error(response.message || "Login failed")
      }

      console.log("[Auth] Login successful, storing credentials...")

      // Store auth token in secure storage
      await StorageService.setAuthToken(response.authToken)

      // Store user profile in Realm for offline access
      const realm = getRealm()
      realm.write(() => {
        // Delete any existing user profiles
        const existingUsers = realm.objects("UserProfile")
        realm.delete(existingUsers)

        // Create new user profile
        realm.create("UserProfile", {
          uid: response.user.uid,
          email: response.user.email,
          username: response.user.username,
          fullName: response.user.fullName,
          emailVerified: response.user.emailVerified,
          isBooker: response.user.isBooker,
          balance: response.user.balance,
          createdAt: response.user.createdAt,
          lastLogin: response.user.lastLogin,
        })
      })

      console.log("[Auth] User data stored in Realm")

      // Set API token for subsequent requests
      ApiService.setToken(response.authToken)

      // Update state
      const userProfile: UserProfile = {
        uid: response.user.uid,
        email: response.user.email,
        username: response.user.username,
        fullName: response.user.fullName,
        emailVerified: response.user.emailVerified,
        isBooker: response.user.isBooker,
        balance: response.user.balance,
        createdAt: response.user.createdAt,
        lastLogin: response.user.lastLogin,
      }

      setUser(userProfile)
      console.log("[Auth] Login complete")
    } catch (err: any) {
      console.error("[Auth] Login error:", err)
      const errorMessage = err.message || "Login failed. Please try again."
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      console.log("[Auth] Logging out...")

      // Clear Realm data
      const realm = getRealm()
      realm.write(() => {
        // Delete user profile
        const users = realm.objects("UserProfile")
        realm.delete(users)

        // Optionally clear other data like tickets, events, etc.
        const tickets = realm.objects("Ticket")
        realm.delete(tickets)

        const events = realm.objects("Event")
        realm.delete(events)

        const scanLogs = realm.objects("ScanLog")
        realm.delete(scanLogs)
      })

      // Clear secure storage
      await StorageService.clear()

      // Clear API token
      ApiService.clearToken()

      // Clear state
      setUser(null)
      setError(null)
      
      console.log("[Auth] Logout successful")
    } catch (err) {
      console.error("[Auth] Logout error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshUserData = useCallback(async () => {
    try {
      console.log("[Auth] Refreshing user data...")
      
      // You could fetch fresh user data from the API here if needed
      // For now, we'll just reload from Realm
      
      const realm = getRealm()
      const realmUser = realm.objects<UserProfileSchema>("UserProfile")[0]
      
      if (realmUser) {
        const userProfile: UserProfile = {
          uid: realmUser.uid,
          email: realmUser.email,
          username: realmUser.username,
          fullName: realmUser.fullName,
          emailVerified: realmUser.emailVerified,
          isBooker: realmUser.isBooker,
          balance: realmUser.balance,
          createdAt: realmUser.createdAt,
          lastLogin: realmUser.lastLogin,
        }
        
        setUser(userProfile)
        console.log("[Auth] User data refreshed")
      }
    } catch (err) {
      console.error("[Auth] Refresh error:", err)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isInitializing,
        error,
        login,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}