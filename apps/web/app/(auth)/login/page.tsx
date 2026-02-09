import { LoginScreen } from "./_components/LoginScreen"

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolved = (await searchParams) ?? undefined
  const nextParam = resolved?.next
  const next = Array.isArray(nextParam) ? nextParam[0] : nextParam
  return <LoginScreen next={next} />
}


