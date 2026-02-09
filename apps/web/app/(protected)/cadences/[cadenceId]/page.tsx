"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import type { Cadence, CadenceStep } from "@repo/shared"
import { getCadence, updateCadence } from "@/lib/api/cadences"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid"
import { toast } from "sonner"

export default function CadenceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const cadenceId = params.cadenceId as string

  const [cadence, setCadence] = useState<Cadence | null>(null)
  const [name, setName] = useState("")
  const [steps, setSteps] = useState<CadenceStep[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getCadence(cadenceId)
      .then((c) => {
        setCadence(c)
        setName(c.name)
        setSteps(c.steps)
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load cadence"))
      .finally(() => setLoading(false))
  }, [cadenceId])

  function updateStep(index: number, updated: CadenceStep) {
    setSteps((prev) => prev.map((s, i) => (i === index ? updated : s)))
  }

  function removeStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index))
  }

  function addStep(type: "SEND_EMAIL" | "WAIT") {
    const newStep: CadenceStep =
      type === "SEND_EMAIL"
        ? { id: uuidv4(), type: "SEND_EMAIL", subject: "", body: "" }
        : { id: uuidv4(), type: "WAIT", seconds: 60 }
    setSteps((prev) => [...prev, newStep])
  }

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await updateCadence(cadenceId, { name, steps })
      setCadence(updated)
      toast.success("Cadence updated")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update cadence")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading cadence...</div>
      </div>
    )
  }

  if (error || !cadence) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error || "Cadence not found"}
        </div>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/cadences")}>
          Back to Cadences
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{cadence.name}</h1>
          <p className="mt-1 text-xs text-muted-foreground font-mono">{cadence.id}</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/cadences")}>
          Back
        </Button>
      </div>

      <div className="mt-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Cadence Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-4">
          <Label>Steps</Label>
          {steps.map((step, index) => (
            <div key={step.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Step {index + 1}: {step.type === "SEND_EMAIL" ? "Send Email" : "Wait"}
                </span>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeStep(index)}>
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>

              {step.type === "SEND_EMAIL" && (
                <>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input
                      value={step.subject}
                      onChange={(e) => updateStep(index, { ...step, subject: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Body</Label>
                    <Textarea
                      value={step.body}
                      onChange={(e) => updateStep(index, { ...step, body: e.target.value })}
                    />
                  </div>
                </>
              )}

              {step.type === "WAIT" && (
                <div className="space-y-2">
                  <Label>Wait (seconds)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={step.seconds}
                    onChange={(e) =>
                      updateStep(index, { ...step, seconds: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => addStep("SEND_EMAIL")}>
              <PlusIcon className="mr-1 h-4 w-4" />
              Add Email Step
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => addStep("WAIT")}>
              <PlusIcon className="mr-1 h-4 w-4" />
              Add Wait Step
            </Button>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
