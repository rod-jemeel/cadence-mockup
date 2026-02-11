"use client"

import * as React from "react"
import {
  Cog6ToothIcon,
  Squares2X2Icon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid"

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const pages = [
  { id: "cadences", title: "Cadences", icon: Squares2X2Icon, group: "Pages" },
  { id: "enrollments", title: "Enrollments", icon: Squares2X2Icon, group: "Pages" },
]

const settings = [
  { id: "settings", title: "Settings", icon: Cog6ToothIcon, group: "Settings" },
  { id: "account", title: "Account", icon: UserCircleIcon, group: "Settings" },
]

const allItems = [...pages, ...settings]

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0)
    } else {
      setQuery("")
    }
  }, [open])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allItems
    return allItems.filter((item) => item.title.toLowerCase().includes(q))
  }, [query])

  const grouped = React.useMemo(() => {
    const groups: Record<string, typeof allItems> = {}
    filtered.forEach((item) => {
      if (!groups[item.group]) {
        groups[item.group] = []
      }
      groups[item.group].push(item)
    })
    return groups
  }, [filtered])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[720px] max-w-[90vw] gap-0 p-0 [&>button:last-child]:hidden">
        <DialogTitle className="sr-only">Search</DialogTitle>

        {/* Search input */}
        <div className="flex items-center border-b px-4">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="ml-2 text-muted-foreground hover:text-foreground"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[400px]">
          <div className="py-2">
            {Object.entries(grouped).map(([group, items]) => (
              <div key={group} className="mt-2 first:mt-0">
                <div className="px-4 py-2 text-xs text-muted-foreground">
                  {group}
                </div>
                {items.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50"
                      onClick={() => onOpenChange(false)}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">{item.title}</span>
                    </button>
                  )
                })}
              </div>
            ))}

            {filtered.length === 0 && query && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No results for &quot;{query}&quot;
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
