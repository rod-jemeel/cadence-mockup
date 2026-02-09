"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { listEnrollments } from "@/lib/api/enrollments"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "@heroicons/react/24/solid"

interface EnrollmentRow {
  id: string
  cadenceId: string
  contactEmail: string
  workflowId: string
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listEnrollments()
      .then(setEnrollments)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load enrollments"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Enrollments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track active and completed workflow enrollments.
          </p>
        </div>
        <Button asChild>
          <Link href="/enrollments/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Enrollment
          </Link>
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {loading && (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading enrollments...</div>
        )}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        {!loading && !error && enrollments.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No enrollments yet. Start a workflow by creating one.
          </div>
        )}
        {enrollments.map((enrollment) => (
          <Link
            key={enrollment.id}
            href={`/enrollments/${enrollment.id}`}
            className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <div>
              <div className="font-medium">{enrollment.contactEmail}</div>
              <div className="text-xs text-muted-foreground font-mono">
                Cadence: {enrollment.cadenceId.slice(0, 8)}
              </div>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              {enrollment.id.slice(0, 8)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
