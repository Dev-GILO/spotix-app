import Realm from "realm"

/**
 * UserProfile Schema
 * Stores authenticated user information
 */
export class UserProfileSchema extends Realm.Object {
  static schema = {
    name: "UserProfile",
    primaryKey: "uid",
    properties: {
      uid: "string",
      email: "string",
      username: "string",
      fullName: "string",
      emailVerified: { type: "bool", default: false },
      isBooker: { type: "bool", default: false },
      balance: { type: "double", default: 0 },
      createdAt: "string",
      lastLogin: "string",
    },
  }

  uid!: string
  email!: string
  username!: string
  fullName!: string
  emailVerified!: boolean
  isBooker!: boolean
  balance!: number
  createdAt!: string
  lastLogin!: string
}

/**
 * Ticket Schema
 * Stores ticket information for offline access
 */
export class TicketSchema extends Realm.Object {
  static schema: Realm.ObjectSchema = {
    name: "Ticket",
    primaryKey: "ticketId",
    properties: {
      ticketId: "string",
      eventId: "string",
      attendeeName: "string",
      attendeeEmail: "string",
      ticketType: "string",
      purchaseDate: "string",
      purchaseTime: "string",
      ticketReference: "string",
      verified: { type: "bool", default: false },
      verificationDate: "string?",
      verificationTime: "string?",
      scannedOffline: { type: "bool", default: false },
      scannerName: "string?",
      scanTimestamp: "string?",
      syncedToServer: { type: "bool", default: false },
    },
  }

  ticketId!: string
  eventId!: string
  attendeeName!: string
  attendeeEmail!: string
  ticketType!: string
  purchaseDate!: string
  purchaseTime!: string
  ticketReference!: string
  verified!: boolean
  verificationDate?: string
  verificationTime?: string
  scannedOffline!: boolean
  scannerName?: string
  scanTimestamp?: string
  syncedToServer!: boolean
}

/**
 * Event Schema
 * Stores event information for offline access
 */
export class EventSchema extends Realm.Object {
  static schema: Realm.ObjectSchema = {
    name: "Event",
    primaryKey: "eventId",
    properties: {
      eventId: "string",
      eventName: "string",
      eventDate: "string",
      eventVenue: "string?",
      ticketsSold: { type: "int", default: 0 },
      revenue: { type: "double", default: 0 },
      isOwner: { type: "bool", default: true },
      ownerId: "string",
      totalTickets: { type: "int", default: 0 },
      downloadedAt: "string?",
      lastSyncedAt: "string?",
    },
  }

  eventId!: string
  eventName!: string
  eventDate!: string
  eventVenue?: string
  ticketsSold!: number
  revenue!: number
  isOwner!: boolean
  ownerId!: string
  totalTickets!: number
  downloadedAt?: string
  lastSyncedAt?: string
}

/**
 * ScanLog Schema
 * Logs all scan operations for audit purposes
 */
export class ScanLogSchema extends Realm.Object {
  static schema: Realm.ObjectSchema = {
    name: "ScanLog",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      ticketId: "string",
      eventId: "string",
      timestamp: "string",
      scannerName: "string",
      scannerUid: "string",
      latency: { type: "double", default: 0 },
      status: "string", // 'success', 'already_verified', 'not_found', 'error'
      errorMessage: "string?",
      isOfflineScan: { type: "bool", default: false },
      syncedToServer: { type: "bool", default: false },
    },
  }

  _id!: Realm.BSON.ObjectId
  ticketId!: string
  eventId!: string
  timestamp!: string
  scannerName!: string
  scannerUid!: string
  latency!: number
  status!: string
  errorMessage?: string
  isOfflineScan!: boolean
  syncedToServer!: boolean
}

/**
 * Realm Configuration
 */
export default {
  path: "spotix-booker.realm",
  schema: [
    UserProfileSchema,
    TicketSchema,
    EventSchema,
    ScanLogSchema,
  ],
  schemaVersion: 2,
  migration: (oldRealm: Realm, newRealm: Realm) => {
    // Handle migration from version 1 to 2
    if (oldRealm.schemaVersion < 2) {
      console.log("[Realm] Migrating from version", oldRealm.schemaVersion, "to 2")
      // UserProfile schema is new, no migration needed for existing data
    }
  },
}