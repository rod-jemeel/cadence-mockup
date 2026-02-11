import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you are looking for does not exist.
        </p>
        <Button asChild className="mt-6">
          <Link href="/cadences">Go to Cadences</Link>
        </Button>
      </div>
    </div>
  )
}
