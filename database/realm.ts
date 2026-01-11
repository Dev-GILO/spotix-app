import Realm from "realm"
import realmConfig from "./schema"

let realmInstance: Realm | null = null

export const initializeRealm = async (): Promise<Realm> => {
  if (realmInstance) {
    return realmInstance
  }

  try {
    realmInstance = await Realm.open(
      realmConfig as Realm.Configuration
    )

    console.log("[Realm] Database initialized successfully")
    return realmInstance
  } catch (error) {
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

export const closeRealm = async (): Promise<void> => {
  if (realmInstance) {
    realmInstance.close()
    realmInstance = null
  }
}
