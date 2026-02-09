"use client"

export type MockUserRole = "admin" | "member" | "viewer"

export type MockSession = {
  userId: string
  email: string
  name: string
  username?: string
  avatarColor?: string
  role: MockUserRole
  createdAt: string
}

const SESSION_KEY = "proto:auth:session"

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

export function getMockSession(): MockSession | null {
  const raw = safeGetItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as MockSession
  } catch {
    return null
  }
}

export function setMockSession(session: MockSession) {
  safeSetItem(SESSION_KEY, JSON.stringify(session))
}

export function clearMockSession() {
  safeRemoveItem(SESSION_KEY)
}


