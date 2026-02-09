"use client"

import * as React from "react"
import { CameraIcon } from "@heroicons/react/24/solid"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getMockSession, setMockSession } from "@/lib/proto/auth"

const AVATAR_COLORS = [
  { id: "primary", label: "Charcoal", value: "bg-zinc-900 text-white" },
  { id: "emerald", label: "Emerald", value: "bg-emerald-500 text-white" },
  { id: "blue", label: "Blue", value: "bg-blue-500 text-white" },
  { id: "purple", label: "Purple", value: "bg-purple-500 text-white" },
  { id: "pink", label: "Pink", value: "bg-pink-500 text-white" },
  { id: "orange", label: "Orange", value: "bg-orange-500 text-white" },
  { id: "cyan", label: "Cyan", value: "bg-cyan-500 text-white" },
  { id: "rose", label: "Rose", value: "bg-rose-500 text-white" },
]

interface ProfileEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProfileUpdated?: () => void
}

export function ProfileEditDialog({
  open,
  onOpenChange,
  onProfileUpdated,
}: ProfileEditDialogProps) {
  const [displayName, setDisplayName] = React.useState("")
  const [username, setUsername] = React.useState("")
  const [avatarColor, setAvatarColor] = React.useState("primary")

  // Load current profile on open
  React.useEffect(() => {
    if (open) {
      const session = getMockSession()
      if (session) {
        setDisplayName(session.name || "")
        setUsername(session.username || session.email?.split("@")[0] || "")
        setAvatarColor(session.avatarColor || "primary")
      }
    }
  }, [open])

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?"

  const currentColorClass =
    AVATAR_COLORS.find((c) => c.id === avatarColor)?.value ||
    AVATAR_COLORS[0].value

  const handleSave = () => {
    const session = getMockSession()
    if (session) {
      setMockSession({
        ...session,
        name: displayName.trim() || session.name,
        username: username.trim() || session.username,
        avatarColor,
      })
      onProfileUpdated?.()
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarFallback className={`${currentColorClass} text-2xl font-medium`}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-sm hover:bg-muted/80"
              onClick={() => {
                // Cycle through colors as a simple "change" action
                const currentIdx = AVATAR_COLORS.findIndex((c) => c.id === avatarColor)
                const nextIdx = (currentIdx + 1) % AVATAR_COLORS.length
                setAvatarColor(AVATAR_COLORS[nextIdx].id)
              }}
            >
              <CameraIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Color picker */}
          <div className="flex items-center gap-2">
            {AVATAR_COLORS.map((color) => {
              const isSelected = avatarColor === color.id
              const bgClass = color.value.split(" ")[0] // e.g. "bg-emerald-500"
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setAvatarColor(color.id)}
                  className={`h-6 w-6 rounded-full ${bgClass} ${
                    isSelected ? "ring-2 ring-offset-2 ring-offset-background ring-foreground" : ""
                  } transition-all hover:scale-110`}
                  title={color.label}
                />
              )
            })}
          </div>

          {/* Form fields */}
          <div className="w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Your profile helps people recognize you. Your name and username are
              also used in the app.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
