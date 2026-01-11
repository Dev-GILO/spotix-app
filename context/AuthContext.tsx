"use client"

import React, { createContext, useState, useEffect, useCallback } from "react"
import ApiService from "@/services/api"
import StorageService from "@/services/storage"
import { initializeRealm } from "@/database/realm"
import type { UserProfile } from "@/types"

interface AuthContextType {
  user: UserProfile | null
  isLoading: boolean
  isInitializing: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
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
        // Initialize Realm database
        await initializeRealm()

        // Check for existing session
        const token = await StorageService.getAuthToken()
        const profile = await StorageService.getUserProfile()

        if (token && profile) {
          ApiService.setToken(token)
          setUser(profile)
          console.log("[Auth] Session restored")
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

      const response = await ApiService.login({ email, password })

      // Store auth token
      await StorageService.setAuthToken(response.token)
      await StorageService.setUserProfile(response.user)

      // Set API token
      ApiService.setToken(response.token)

      setUser(response.user)
      console.log("[Auth] Login successful")
    } catch (err: any) {
      const errorMessage = err.message || "Login failed"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      await StorageService.clear()
      ApiService.clearToken()
      setUser(null)
      setError(null)
      console.log("[Auth] Logout successful")
    } catch (err) {
      console.error("[Auth] Logout error:", err)
    } finally {
      setIsLoading(false)
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
