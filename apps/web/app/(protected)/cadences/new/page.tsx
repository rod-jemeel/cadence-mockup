"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import type { CadenceStep } from "@repo/shared"
import { createCadence } from "@/lib/api/cadences"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid"
import { toast } from "sonner"

function emptyEmailStep(): CadenceStep {
  return { id: uuidv4(), type: "SEND_EMAIL", subject: "", body: "" }
}

function emptyWaitStep(): CadenceStep {
  return { id: uuidv4(), type: "WAIT", seconds: 60 }
}

export default function NewCadencePage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [steps, setSteps] = useState<CadenceStep[]>([emptyEmailStep()])
  const [submitting, setSubmitting] = useState(false)

  function updateStep(index: number, updated: CadenceStep) {
    setSteps((prev) => prev.map((s, i) => (i === index ? updated : s)))
  }

  function removeStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index))
  }

  function addStep(type: "SEND_EMAIL" | "WAIT") {
    setSteps((prev) => [...prev, type === "SEND_EMAIL" ? emptyEmailStep() : emptyWaitStep()])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Cadence name is required")
      return
    }
    if (steps.length === 0) {
      toast.error("At least one step is required")
      return
    }
    setSubmitting(true)
    try {
      const cadence = await createCadence({ name: name.trim(), steps })
      toast.success("Cadence created")
      router.push(`/cadences/${cadence.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create cadence")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <h1 className="text-2xl font-semibold tracking-tight">New Cadence</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Define a sequence of email and wait steps.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Cadence Name</Label>
          <Input
            id="name"
            placeholder="e.g. Welcome Series"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <Label>Steps</Label>
          {steps.map((step, index) => (
            <div key={step.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Step {index + 1}: {step.type === "SEND_EMAIL" ? "Send Email" : "Wait"}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStep(index)}
                  disabled={steps.length <= 1}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>

              {step.type === "SEND_EMAIL" && (
                <>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input
                      placeholder="Email subject"
                      value={step.subject}
                      onChange={(e) =>
                        updateStep(index, { ...step, subject: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Body</Label>
                    <Textarea
                      placeholder="Email body"
                      value={step.body}
                      onChange={(e) =>
                        updateStep(index, { ...step, body: e.target.value })
                      }
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

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Cadence"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/cadences")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
