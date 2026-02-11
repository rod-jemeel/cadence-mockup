"use client"

import Link from "next/link"
import {
  ArrowDownTrayIcon,
  ChevronRightIcon,
  ShareIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/solid"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const ROUTE_META: Record<
  string,
  { label: string; Icon: React.ComponentType<{ className?: string }> }
> = {}

export function AppShellHeader({
  pathname,
  currentPage,
  onShare,
}: {
  pathname: string
  currentPage: string
  onShare: () => void
}) {
  const meta = ROUTE_META[pathname] ?? { label: currentPage, Icon: Squares2X2Icon }
  const CurrentIcon = meta.Icon

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b px-4 md:px-6">
      <Breadcrumb className="shrink-0">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/cadences" className="inline-flex items-center gap-1.5">
                <Squares2X2Icon className="h-4 w-4" />
                Cadences
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRightIcon className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage className="inline-flex items-center gap-1.5">
              <CurrentIcon className="h-4 w-4" />
              {currentPage}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.message("Export", { description: "Implemented soon." })}
          className="rounded-md border-muted-foreground/20 text-muted-foreground hover:bg-muted/30 hover:text-foreground"
        >
          <ArrowDownTrayIcon className="mr-1.5 h-3.5 w-3.5" />
          Export
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onShare}
          className="rounded-md bg-muted/50 px-4 hover:bg-muted active:bg-muted/80"
        >
          <ShareIcon className="mr-1.5 h-3.5 w-3.5" />
          Share
        </Button>
      </div>
    </header>
  )
}
