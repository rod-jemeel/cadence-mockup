"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { AppSidebar } from "./AppSidebar"
import { AppShellHeader } from "./AppShellHeader"

// Sidebar resize constraints
const SIDEBAR_MIN = 200
const SIDEBAR_MAX = 400
const SIDEBAR_DEFAULT = 256

// Route to breadcrumb mapping
const ROUTE_NAMES: Record<string, string> = {
  "/dashboard": "Dashboard",
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [sidebarWidth, setSidebarWidth] = React.useState(SIDEBAR_DEFAULT)
  const sidebarWidthRef = React.useRef(SIDEBAR_DEFAULT)

  // Sidebar resize
  const startSidebarResize = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault()

    const onMouseMove = (e: MouseEvent) => {
      const newWidth = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, e.clientX))
      sidebarWidthRef.current = newWidth
      if (containerRef.current) {
        containerRef.current.style.setProperty("--sidebar-width", `${newWidth}px`)
      }
    }

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
      setSidebarWidth(sidebarWidthRef.current)
    }

    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }, [])

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.message("Link copied", {
      description: "The current page URL was copied to your clipboard.",
    })
  }

  const currentPage = ROUTE_NAMES[pathname] || "Page"
  const isDashboard = pathname === "/dashboard"

  return (
    <SidebarProvider
      ref={containerRef}
      style={
        { "--sidebar-width": `${sidebarWidth}px` } as React.CSSProperties
      }
      className="overflow-x-hidden"
    >
      <AppSidebar />
      {/* Sidebar resize handle */}
      <div
        onMouseDown={startSidebarResize}
        className="absolute top-0 bottom-0 z-50 w-2 cursor-col-resize"
        style={{ left: `calc(var(--sidebar-width) - 4px)` }}
      />
      <SidebarInset className="flex min-w-0 flex-col overflow-x-hidden">
        <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
          {!isDashboard && (
            <AppShellHeader
              pathname={pathname}
              currentPage={currentPage}
              onShare={handleShare}
            />
          )}
          <main className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
