"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import type { CadenceStep } from "@repo/shared"
import { useEnrollmentState } from "@/lib/hooks/use-enrollment-state"
import { updateEnrollmentCadence } from "@/lib/api/enrollments"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid"
import { toast } from "sonner"

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  RUNNING: "default",
  COMPLETED: "secondary",
  FAILED: "destructive",
  CANCELLED: "outline",
}

export default function EnrollmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const enrollmentId = params.enrollmentId as string
  const { state, error, loading, refresh } = useEnrollmentState(enrollmentId)

  const [editingSteps, setEditingSteps] = useState(false)
  const [newSteps, setNewSteps] = useState<CadenceStep[]>([])
  const [updating, setUpdating] = useState(false)

  function startEditing() {
    if (state) {
      setNewSteps(state.steps.map((s) => ({ ...s })))
      setEditingSteps(true)
    }
  }

  function updateStep(index: number, updated: CadenceStep) {
    setNewSteps((prev) => prev.map((s, i) => (i === index ? updated : s)))
  }

  function removeStep(index: number) {
    setNewSteps((prev) => prev.filter((_, i) => i !== index))
  }

  function addStep(type: "SEND_EMAIL" | "WAIT") {
    const step: CadenceStep =
      type === "SEND_EMAIL"
        ? { id: uuidv4(), type: "SEND_EMAIL", subject: "", body: "" }
        : { id: uuidv4(), type: "WAIT", seconds: 60 }
    setNewSteps((prev) => [...prev, step])
  }

  async function handleUpdateCadence() {
    setUpdating(true)
    try {
      await updateEnrollmentCadence(enrollmentId, { steps: newSteps })
      toast.success("Cadence steps updated")
      setEditingSteps(false)
      refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update cadence")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading enrollment...</div>
      </div>
    )
  }

  if (error || !state) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error || "Enrollment not found"}
        </div>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/enrollments")}>
          Back to Enrollments
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{state.contactEmail}</h1>
          <p className="mt-1 text-xs text-muted-foreground font-mono">{enrollmentId}</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/enrollments")}>
          Back
        </Button>
      </div>

      {/* Status overview */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-xs text-muted-foreground">Status</div>
          <Badge variant={STATUS_VARIANT[state.status] || "outline"} className="mt-1">
            {state.status}
          </Badge>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-xs text-muted-foreground">Current Step</div>
          <div className="mt-1 text-lg font-semibold">
            {Math.min(state.currentStepIndex + 1, state.steps.length)} / {state.steps.length}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-xs text-muted-foreground">Version</div>
          <div className="mt-1 text-lg font-semibold">v{state.stepsVersion}</div>
        </div>
      </div>

      {/* Steps visualization */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <Label className="text-base">Steps</Label>
          {state.status === "RUNNING" && !editingSteps && (
            <Button variant="outline" size="sm" onClick={startEditing}>
              Edit Steps (Live Update)
            </Button>
          )}
        </div>

        {!editingSteps ? (
          <div className="mt-3 space-y-2">
            {state.steps.map((step, index) => {
              const isCurrent = index === state.currentStepIndex && state.status === "RUNNING"
              const isCompleted = index < state.currentStepIndex
              return (
                <div
                  key={step.id}
                  className={`rounded-lg border p-3 ${
                    isCurrent
                      ? "border-primary bg-primary/5"
                      : isCompleted
                        ? "border-muted bg-muted/30 opacity-60"
                        : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">
                      {step.type === "SEND_EMAIL" ? "Send Email" : "Wait"}
                    </span>
                    {isCurrent && (
                      <Badge variant="default" className="ml-auto text-xs">
                        Active
                      </Badge>
                    )}
                    {isCompleted && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        Done
                      </Badge>
                    )}
                  </div>
                  {step.type === "SEND_EMAIL" && (
                    <div className="mt-2 pl-8 text-sm text-muted-foreground">
                      Subject: {step.subject}
                    </div>
                  )}
                  {step.type === "WAIT" && (
                    <div className="mt-2 pl-8 text-sm text-muted-foreground">
                      Duration: {step.seconds}s
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {newSteps.map((step, index) => (
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
                    <Input
                      placeholder="Subject"
                      value={step.subject}
                      onChange={(e) => updateStep(index, { ...step, subject: e.target.value })}
                    />
                    <Textarea
                      placeholder="Body"
                      value={step.body}
                      onChange={(e) => updateStep(index, { ...step, body: e.target.value })}
                    />
                  </>
                )}
                {step.type === "WAIT" && (
                  <Input
                    type="number"
                    min={1}
                    value={step.seconds}
                    onChange={(e) =>
                      updateStep(index, { ...step, seconds: parseInt(e.target.value) || 1 })
                    }
                  />
                )}
              </div>
            ))}

            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => addStep("SEND_EMAIL")}>
                <PlusIcon className="mr-1 h-4 w-4" />
                Email
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => addStep("WAIT")}>
                <PlusIcon className="mr-1 h-4 w-4" />
                Wait
              </Button>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleUpdateCadence} disabled={updating}>
                {updating ? "Updating..." : "Apply Update"}
              </Button>
              <Button variant="outline" onClick={() => setEditingSteps(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
