"use client"

export type ThemeMode = "light" | "dark" | "system"

const THEME_KEY = "proto:app:theme"

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "system"
  const raw = window.localStorage.getItem(THEME_KEY)
  if (raw === "light" || raw === "dark" || raw === "system") return raw
  return "system"
}

export function setStoredTheme(theme: ThemeMode) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(THEME_KEY, theme)
}

export function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light"
}

export function resolveTheme(theme: ThemeMode): "light" | "dark" {
  return theme === "system" ? getSystemTheme() : theme
}

export function applyResolvedThemeToDocument(resolved: "light" | "dark") {
  if (typeof document === "undefined") return
  const root = document.documentElement
  root.classList.toggle("dark", resolved === "dark")
  root.style.colorScheme = resolved
}


