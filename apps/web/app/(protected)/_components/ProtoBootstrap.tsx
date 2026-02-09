"use client"

import * as React from "react"

import { ensureProtoSeed } from "@/lib/proto/storage"

export function ProtoBootstrap() {
  React.useEffect(() => {
    ensureProtoSeed()
  }, [])

  return null
}


