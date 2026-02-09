import { Suspense } from "react"
import { LoginScreen } from "./_components/LoginScreen"

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolved = await searchParams
  const nextParam = resolved?.next
  const next = Array.isArray(nextParam) ? nextParam[0] : nextParam
  return <LoginScreen next={next} />
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <Suspense fallback={<LoginScreen />}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  )
}
