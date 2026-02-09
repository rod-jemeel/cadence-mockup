"use client"

import * as React from "react"
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  applyResolvedThemeToDocument,
  getStoredTheme,
  resolveTheme,
  setStoredTheme,
  type ThemeMode,
} from "@/lib/proto/theme"

export function ThemeToggle() {
  const [mode, setMode] = React.useState<ThemeMode>("system")

  React.useEffect(() => {
    const stored = getStoredTheme()
    setMode(stored)
    applyResolvedThemeToDocument(resolveTheme(stored))
  }, [])

  const update = (next: ThemeMode) => {
    setMode(next)
    setStoredTheme(next)
    applyResolvedThemeToDocument(resolveTheme(next))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          <SunIcon className="h-4 w-4 dark:hidden" />
          <MoonIcon className="hidden h-4 w-4 dark:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => update("light")}>
          Light {mode === "light" ? "✓" : ""}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => update("dark")}>
          Dark {mode === "dark" ? "✓" : ""}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => update("system")}>
          System {mode === "system" ? "✓" : ""}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


