"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { Cadence } from "@repo/shared"
import { listCadences } from "@/lib/api/cadences"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "@heroicons/react/24/solid"

export default function CadencesPage() {
  const [cadences, setCadences] = useState<Cadence[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listCadences()
      .then(setCadences)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load cadences"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cadences</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage email cadences.
          </p>
        </div>
        <Button asChild>
          <Link href="/cadences/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Cadence
          </Link>
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {loading && (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading cadences...</div>
        )}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        {!loading && !error && cadences.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No cadences yet. Create your first one.
          </div>
        )}
        {cadences.map((cadence) => (
          <Link
            key={cadence.id}
            href={`/cadences/${cadence.id}`}
            className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <div>
              <div className="font-medium">{cadence.name}</div>
              <div className="text-sm text-muted-foreground">
                {cadence.steps.length} step{cadence.steps.length !== 1 ? "s" : ""}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">{cadence.id.slice(0, 8)}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
