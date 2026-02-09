import { Suspense } from "react"
import { AppShell } from "./_components/AppShell"
import { ProtoBootstrap } from "./_components/ProtoBootstrap"
import { AuthGate } from "./_components/AuthGate"

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Suspense fallback={null}>
      <AppShell>
        <ProtoBootstrap />
        <AuthGate>{children}</AuthGate>
      </AppShell>
    </Suspense>
  )
}


