"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"

import { getMockSession } from "@/lib/proto/auth"

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    const session = getMockSession()
    if (!session) {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : ""
      router.replace(`/login${next}`)
      return
    }
    setReady(true)
  }, [pathname, router])

  if (!ready) {
    return null
  }

  return <>{children}</>
}


