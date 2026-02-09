"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Cadence } from "@repo/shared"
import { listCadences } from "@/lib/api/cadences"
import { createEnrollment } from "@/lib/api/enrollments"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export default function NewEnrollmentPage() {
  const router = useRouter()
  const [cadences, setCadences] = useState<Cadence[]>([])
  const [cadenceId, setCadenceId] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [loadingCadences, setLoadingCadences] = useState(true)

  useEffect(() => {
    listCadences()
      .then(setCadences)
      .catch(() => toast.error("Failed to load cadences"))
      .finally(() => setLoadingCadences(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cadenceId) {
      toast.error("Please select a cadence")
      return
    }
    if (!contactEmail.trim()) {
      toast.error("Contact email is required")
      return
    }
    setSubmitting(true)
    try {
      const enrollment = await createEnrollment({
        cadenceId,
        contactEmail: contactEmail.trim(),
      })
      toast.success("Enrollment started")
      router.push(`/enrollments/${enrollment.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create enrollment")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl p-6">
      <h1 className="text-2xl font-semibold tracking-tight">New Enrollment</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enroll a contact into a cadence workflow.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="space-y-2">
          <Label>Cadence</Label>
          {loadingCadences ? (
            <div className="text-sm text-muted-foreground">Loading cadences...</div>
          ) : cadences.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No cadences available.{" "}
              <button
                type="button"
                className="underline"
                onClick={() => router.push("/cadences/new")}
              >
                Create one first
              </button>
            </div>
          ) : (
            <Select value={cadenceId} onValueChange={setCadenceId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a cadence" />
              </SelectTrigger>
              <SelectContent>
                {cadences.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.steps.length} steps)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Contact Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="contact@example.com"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting || cadences.length === 0}>
            {submitting ? "Starting..." : "Start Enrollment"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/enrollments")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
