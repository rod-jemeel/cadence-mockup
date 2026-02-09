"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type FormDialogSize = "sm" | "md" | "lg"

export function FormDialog({
  open,
  onOpenChange,
  title,
  children,
  size = "lg",
  footer,
  contentClassName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  size?: FormDialogSize
  footer?: React.ReactNode
  contentClassName?: string
  headerClassName?: string
  footerClassName?: string
}) {
  const sizeClass =
    size === "sm"
      ? "sm:max-w-sm"
      : size === "md"
        ? "sm:max-w-md"
        : "sm:max-w-lg"

  // Only render when open to prevent duplicate modals
  if (!open) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("gap-0 p-0 max-h-[90vh] flex flex-col", sizeClass, contentClassName)}>
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="flex flex-col gap-4">{children}</div>
        </div>

        {footer ? (
          <div className="shrink-0 flex flex-col">
            {footer}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

// Helper for standard modal footer with full-width primary action
export function FormDialogFooter({
  submitLabel = "Save",
  submitIcon,
  isLoading = false,
  formId,
}: {
  onCancel?: () => void
  submitLabel?: string
  submitIcon?: React.ReactNode
  isLoading?: boolean
  formId?: string
}) {
  const handleClick = React.useCallback(() => {
    if (!formId) {
      return
    }
    
    const form = document.getElementById(formId) as HTMLFormElement | null
    
    if (!form) {
      return
    }
    
    try {
      form.requestSubmit()
    } catch {
      // no-op (best effort)
    }
  }, [formId])

  return (
    <Button 
      type="button"
      onClick={handleClick}
      disabled={isLoading} 
      className="w-full h-12 rounded-none rounded-b-lg"
    >
      {submitIcon}
      {isLoading ? "Processing..." : submitLabel}
    </Button>
  )
}


