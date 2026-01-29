import Realm from "realm"
import realmConfig from "./schema"

let realmInstance: Realm | null = null
let isInitializing: boolean = false

export const initializeRealm = async (): Promise<Realm> => {
  if (realmInstance) {
    return realmInstance
  }

  if (isInitializing) {
    // Wait for initialization to complete
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (realmInstance) {
          clearInterval(checkInterval)
          resolve(realmInstance)
        }
      }, 100)

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval)
        reject(new Error("Realm initialization timeout"))
      }, 10000)
    })
  }

  try {
    isInitializing = true
    console.log("[Realm] Initializing database...")
    
    realmInstance = await Realm.open(
      realmConfig as Realm.Configuration
    )

    console.log("[Realm] Database initialized successfully")
    isInitializing = false
    return realmInstance
  } catch (error) {
    isInitializing = false
    console.error("[Realm] Initialization failed:", error)
    throw error
  }
}

export const getRealm = (): Realm => {
  if (!realmInstance) {
    throw new Error("Realm not initialized. Call initializeRealm first.")
  }
  return realmInstance
}

export const getRealmOrNull = (): Realm | null => {
  return realmInstance
}

export const isRealmInitialized = (): boolean => {
  return realmInstance !== null
}

export const closeRealm = async (): Promise<void> => {
  if (realmInstance) {
    realmInstance.close()
    realmInstance = null
    console.log("[Realm] Database closed")
  }
}