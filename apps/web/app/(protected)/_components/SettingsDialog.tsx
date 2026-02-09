"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  BellIcon,
  Cog6ToothIcon,
  IdentificationIcon,
  LinkIcon,
  LockClosedIcon,
  PaintBrushIcon,
  Square2StackIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid"
import { QuestionMarkCircleIcon as QuestionMarkCircleIconOutline } from "@heroicons/react/24/outline"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

import { clearMockSession } from "@/lib/proto/auth"
import {
  applyResolvedThemeToDocument,
  getStoredTheme,
  resolveTheme,
  setStoredTheme,
  type ThemeMode,
} from "@/lib/proto/theme"
import { resetProtoData } from "@/lib/proto/storage"

type SettingsSection =
  | "general"
  | "notifications"
  | "personalization"
  | "apps"
  | "dataControls"
  | "security"
  | "parentalControls"
  | "account"

const sections: Array<{
  key: SettingsSection
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { key: "general", label: "General", icon: Cog6ToothIcon },
  { key: "notifications", label: "Notifications", icon: BellIcon },
  { key: "personalization", label: "Personalization", icon: PaintBrushIcon },
  { key: "apps", label: "Apps & Connectors", icon: LinkIcon },
  { key: "dataControls", label: "Data controls", icon: Square2StackIcon },
  { key: "security", label: "Security", icon: LockClosedIcon },
  { key: "parentalControls", label: "Parental controls", icon: UserGroupIcon },
  { key: "account", label: "Account", icon: IdentificationIcon },
]

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="p-6">
      <Empty className="min-h-[360px]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <QuestionMarkCircleIconOutline />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>Implemented soon for this prototype.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}

function Row({
  label,
  description,
  right,
}: {
  label: string
  description?: string
  right: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {description ? (
          <div className="mt-1 text-sm text-muted-foreground">{description}</div>
        ) : null}
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  )
}

export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [theme, setTheme] = React.useState<ThemeMode>("system")
  const [section, setSection] = React.useState<SettingsSection>("general")

  React.useEffect(() => {
    if (!open) return
    setTheme(getStoredTheme())
    setSection("general")
  }, [open])

  const updateTheme = (next: ThemeMode) => {
    setTheme(next)
    setStoredTheme(next)
    applyResolvedThemeToDocument(resolveTheme(next))
    toast.success("Theme updated")
  }

  const logout = () => {
    clearMockSession()
    toast.success("Signed out")
    window.location.href = "/login"
  }

  const reset = () => {
    resetProtoData()
    clearMockSession()
    toast.success("Demo data reset")
    window.location.href = "/login"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="h-[72vh] overflow-hidden rounded-2xl p-0 sm:max-w-3xl"
      >
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <div className="grid h-full grid-cols-[220px_1fr]">
          {/* Left navigation */}
          <div className="flex h-full flex-col border-r bg-muted/20">
            <div className="flex items-center gap-2 p-3">
              <DialogClose asChild>
                <Button variant="ghost" size="icon" aria-label="Close settings">
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </DialogClose>
              <div className="text-sm font-medium text-muted-foreground">Settings</div>
            </div>

            <ScrollArea className="flex-1 px-2 pb-3">
              <div className="flex flex-col gap-1">
                {sections.map((s) => {
                  const Icon = s.icon
                  const active = s.key === section
                  return (
                    <Button
                      key={s.key}
                      variant="ghost"
                      onClick={() => setSection(s.key)}
                      className={[
                        "w-full justify-start gap-3 px-3",
                        active
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      ].join(" ")}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="truncate">{s.label}</span>
                    </Button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Right panel */}
          <div className="flex h-full min-w-0 flex-col">
            <div className="border-b px-6 py-5">
              <div className="text-xl font-semibold">
                {sections.find((s) => s.key === section)?.label ?? "Settings"}
              </div>
            </div>

            <ScrollArea className="flex-1">
              {section === "general" ? (
                <div className="px-6">
                  <Row
                    label="Appearance"
                    right={
                      <Select
                        value={theme}
                        onValueChange={(v) => updateTheme(v as ThemeMode)}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue placeholder="Theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="system">System</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    }
                  />
                  <Separator />

                  <Row
                    label="Accent color"
                    right={
                      <Button variant="outline" className="w-36 justify-between" disabled>
                        <span className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-muted-foreground/50" />
                          Default
                        </span>
                        <span className="text-muted-foreground">▾</span>
                      </Button>
                    }
                  />
                  <Separator />

                  <Row
                    label="Language"
                    right={
                      <Button variant="outline" className="w-36 justify-between" disabled>
                        Auto-detect <span className="text-muted-foreground">▾</span>
                      </Button>
                    }
                  />
                  <Separator />

                  <Row
                    label="Spoken language"
                    description="For best results, select the language you mainly speak."
                    right={
                      <Button variant="outline" className="w-36 justify-between" disabled>
                        Auto-detect <span className="text-muted-foreground">▾</span>
                      </Button>
                    }
                  />
                  <Separator />

                  <Row
                    label="Voice"
                    right={
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" disabled>
                          Play
                        </Button>
                        <Button variant="outline" className="w-28 justify-between" disabled>
                          Spruce <span className="text-muted-foreground">▾</span>
                        </Button>
                      </div>
                    }
                  />
                  <Separator />

                  <Row
                    label="Separate voice mode"
                    description="Keep voice in a separate full screen without real-time transcripts."
                    right={<Switch disabled />}
                  />
                </div>
              ) : section === "dataControls" ? (
                <div className="px-6">
                  <Row
                    label="Reset demo data"
                    description="Clears local prototype storage and signs you out."
                    right={
                      <Button variant="outline" onClick={reset}>
                        Reset demo data
                      </Button>
                    }
                  />
                  <Separator />
                  <Row
                    label="Export data"
                    description="Download your prototype data (coming soon)."
                    right={
                      <Button variant="outline" disabled>
                        Export
                      </Button>
                    }
                  />
                </div>
              ) : section === "account" ? (
                <div className="px-6">
                  <Row
                    label="Account"
                    description="Mock account for prototype usage."
                    right={
                      <Button variant="destructive" onClick={logout}>
                        Log out
                      </Button>
                    }
                  />
                  <Separator />
                  <Row
                    label="Accent"
                    description="This prototype uses Flighty-inspired `#F6BD02`."
                    right={
                      <Button variant="outline" className="w-36 justify-between" disabled>
                        <span className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-primary" />
                          Default
                        </span>
                        <span className="text-muted-foreground">▾</span>
                      </Button>
                    }
                  />
                </div>
              ) : (
                <ComingSoon title={sections.find((s) => s.key === section)?.label ?? "Settings"} />
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


