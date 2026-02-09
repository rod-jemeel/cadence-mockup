"use client"

/**
 * Prototype persistence helpers.
 * - Namespaced keys
 * - Schema versioning
 * - Seed + reset for consistent demos
 */

const APP_NS = "proto:app"
const SCHEMA_VERSION = 1

const KEYS = {
  schemaVersion: `${APP_NS}:schemaVersion`,
  seed: `${APP_NS}:seed`,
} as const

export type ProtoSeed = {
  createdAt: string
  facilities: Array<{
    id: string
    name: string
    region: string
  }>
}

export function getSchemaVersion() {
  return SCHEMA_VERSION
}

function safeGetItem(key: string) {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key: string, value: string) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // ignore
  }
}

function safeRemoveItem(key: string) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export function loadProtoSeed(): ProtoSeed | null {
  const raw = safeGetItem(KEYS.seed)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ProtoSeed
  } catch {
    return null
  }
}

export function ensureProtoSeed(): ProtoSeed {
  const currentVersion = safeGetItem(KEYS.schemaVersion)
  if (currentVersion !== String(SCHEMA_VERSION)) {
    resetProtoData()
  }

  const existing = loadProtoSeed()
  if (existing) return existing

  const seed: ProtoSeed = {
    createdAt: new Date().toISOString(),
    facilities: [
      { id: "fac-mrf-01", name: "Riverside MRF", region: "Austin, TX" },
      { id: "fac-landfill-01", name: "Pecan Creek Landfill", region: "Austin, TX" },
      { id: "fac-compost-01", name: "Southgate Compost Works", region: "Austin, TX" },
    ],
  }

  safeSetItem(KEYS.schemaVersion, String(SCHEMA_VERSION))
  safeSetItem(KEYS.seed, JSON.stringify(seed))
  return seed
}

export function resetProtoData() {
  safeRemoveItem(KEYS.schemaVersion)
  safeRemoveItem(KEYS.seed)
  // Future: remove additional namespaced keys here as they are introduced.
}


