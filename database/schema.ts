import Realm from "realm"

export class TicketSchema extends Realm.Object {
  static schema = {
    name: "Ticket",
    primaryKey: "ticketId",
    properties: {
      ticketId: "string",
      eventId: "string",
      ticketType: "string",
      purchaseDate: "string",
      purchaseTime: "string",
      scanned: { type: "bool", default: false },
      scannerName: "string?",
      scanTimestamp: "string?",
    },
    indexes: ["eventId"],
  }

  ticketId!: string
  eventId!: string
  ticketType!: string
  purchaseDate!: string
  purchaseTime!: string
  scanned!: boolean
  scannerName?: string
  scanTimestamp?: string
}

export class EventSchema extends Realm.Object {
  static schema = {
    name: "Event",
    primaryKey: "eventId",
    properties: {
      eventId: "string",
      eventName: "string",
      date: "string",
      location: "string?",
      totalTickets: "int",
      downloadedAt: "string?",
      syncedAt: "string?",
    },
  }

  eventId!: string
  eventName!: string
  date!: string
  location?: string
  totalTickets!: number
  downloadedAt?: string
  syncedAt?: string
}

export class ScanLogSchema extends Realm.Object {
  static schema = {
    name: "ScanLog",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      ticketId: "string",
      eventId: "string",
      timestamp: "string",
      scannerName: "string",
      latency: "double",
      status: "string",
    },
    indexes: ["eventId", "timestamp"],
  }

  _id!: Realm.BSON.ObjectId
  ticketId!: string
  eventId!: string
  timestamp!: string
  scannerName!: string
  latency!: number
  status!: string
}

export default {
  path: "spotix-booker.realm",
  schema: [TicketSchema, EventSchema, ScanLogSchema],
  schemaVersion: 1,
}
