import { redirect } from "next/navigation"

export function RootRedirect() {
  redirect("/login")
  return null
}


