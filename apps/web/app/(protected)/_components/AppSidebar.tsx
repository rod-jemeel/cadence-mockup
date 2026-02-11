"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  AdjustmentsHorizontalIcon,
  ArrowRightOnRectangleIcon,
  EnvelopeIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  QuestionMarkCircleIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/solid"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

import { clearMockSession, getMockSession } from "@/lib/proto/auth"
import { Shape59 } from "@/app/_components/Shape59"

import { SettingsDialog } from "./SettingsDialog"
import { SearchDialog } from "./SearchDialog"
import { ProfileEditDialog } from "./ProfileEditDialog"

const AVATAR_COLOR_MAP: Record<string, string> = {
  primary: "bg-zinc-900 text-white",
  emerald: "bg-emerald-500 text-white",
  blue: "bg-blue-500 text-white",
  purple: "bg-purple-500 text-white",
  pink: "bg-pink-500 text-white",
  orange: "bg-orange-500 text-white",
  cyan: "bg-cyan-500 text-white",
  rose: "bg-rose-500 text-white",
}

const actions = [
  { label: "Search", icon: MagnifyingGlassIcon, action: "search" },
  { label: "Cadences", icon: EnvelopeIcon, href: "/cadences" },
  { label: "Enrollments", icon: PlayIcon, href: "/enrollments" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [profileOpen, setProfileOpen] = React.useState(false)
  const [sessionName, setSessionName] = React.useState("Demo User")
  const [sessionUsername, setSessionUsername] = React.useState("demo")
  const [avatarColor, setAvatarColor] = React.useState("primary")

  const loadSession = React.useCallback(() => {
    const session = getMockSession()
    if (!session) return
    setSessionName(session.name)
    setSessionUsername(session.username || session.email?.split("@")[0] || "demo")
    setAvatarColor(session.avatarColor || "primary")
  }, [])

  React.useEffect(() => {
    setMounted(true)
    loadSession()
  }, [loadSession])

  const avatarColorClass = AVATAR_COLOR_MAP[avatarColor] || AVATAR_COLOR_MAP.primary
  const initials = sessionName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?"

  return (
    <Sidebar collapsible="icon" className="overflow-x-hidden">
      <SidebarHeader className="overflow-x-hidden">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[6px] bg-primary">
            <Shape59 className="text-primary-foreground" width={14} height={14} />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-[19px] font-semibold leading-none tracking-tight">Cadence</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {actions.map((item, idx) => {
                const Icon = item.icon
                const isActive = item.href ? pathname === item.href || pathname.startsWith(item.href + "/") : false

                if (item.href) {
                  return (
                    <SidebarMenuItem key={idx}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="text-foreground hover:bg-muted/50 data-[active=true]:bg-muted"
                      >
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }

                return (
                  <SidebarMenuItem key={idx}>
                    <SidebarMenuButton
                      onClick={() => {
                        if (item.action === "search") {
                          setSearchOpen(true)
                        }
                      }}
                      className="text-foreground hover:bg-muted/50"
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-2 overflow-x-hidden">
        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
        <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
        <ProfileEditDialog open={profileOpen} onOpenChange={setProfileOpen} onProfileUpdated={loadSession} />

        {/* Need help widget */}
        <div className="group-data-[collapsible=icon]:hidden">
          <div className="relative w-full overflow-hidden rounded-lg border border-muted bg-black p-3 text-white">
            <div className="absolute inset-0 bg-[url('/sidebar-bg.jpg')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent" />
            <div className="relative flex h-28 flex-col items-start justify-end gap-2">
              <div className="space-y-0.5">
                <div className="text-sm font-semibold leading-none">Need help?</div>
                <div className="max-w-[220px] text-xs leading-snug text-white/80">
                  Learn how to get started with the platform.
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="relative h-8 rounded-md border border-white/10 bg-black px-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] hover:bg-black/90 hover:border-white/15"
                onClick={() => toast.message("Learn more", { description: "Implemented soon." })}
              >
                Learn more
              </Button>
            </div>
          </div>
        </div>

        {/* Render placeholder until mounted to avoid hydration mismatch from Radix IDs */}
        {!mounted ? (
          <div className="flex w-full items-center gap-3 overflow-hidden rounded-lg p-2 text-foreground">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className={`${avatarColorClass} text-xs font-medium`}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col items-start leading-tight group-data-[collapsible=icon]:hidden">
              <div className="w-full truncate text-left text-sm font-medium">{sessionName}</div>
              <div className="w-full truncate text-left text-xs text-muted-foreground">@{sessionUsername}</div>
            </div>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-3 overflow-hidden rounded-lg p-2 text-foreground hover:bg-accent transition-colors"
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className={`${avatarColorClass} text-xs font-medium`}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col items-start leading-tight group-data-[collapsible=icon]:hidden">
                  <div className="w-full truncate text-left text-sm font-medium">{sessionName}</div>
                  <div className="w-full truncate text-left text-xs text-muted-foreground">@{sessionUsername}</div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="top"
              className="w-[var(--radix-popper-anchor-width)] min-w-[var(--radix-popper-anchor-width)]"
            >
              <DropdownMenuItem
                className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                onClick={() => setProfileOpen(true)}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className={`${avatarColorClass} text-xs font-medium`}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col items-start leading-tight">
                  <div className="w-full truncate text-left text-sm font-medium">{sessionName}</div>
                  <div className="w-full truncate text-left text-xs text-muted-foreground">@{sessionUsername}</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={() => setSettingsOpen(true)}
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4 text-muted-foreground" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={() => {
                  toast.message("Help", { description: "Implemented soon." })
                }}
              >
                <QuestionMarkCircleIcon className="h-4 w-4 text-muted-foreground" />
                <span>Help</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/" className="flex items-center gap-2">
                  <HomeIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Home</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={() => {
                  clearMockSession()
                  window.location.href = "/login"
                }}
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 text-muted-foreground" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
