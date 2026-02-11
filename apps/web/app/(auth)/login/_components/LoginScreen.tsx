"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { EyeSlashIcon } from "@heroicons/react/24/outline"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Shape59 } from "@/app/_components/Shape59"

import { setMockSession } from "@/lib/proto/auth"

function sanitizeNext(next: string | undefined) {
  if (!next) return "/cadences"
  if (!next.startsWith("/")) return "/cadences"
  if (next.startsWith("//")) return "/cadences"
  if (next.startsWith("/login")) return "/cadences"
  return next
}

export function LoginScreen({ next }: { next?: string }) {
  const router = useRouter()
  const [mounted, setMounted] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const schema = React.useMemo(
    () =>
      z.object({
        email: z.string().email("Enter a valid email."),
        password: z.string().min(6, "Password must be at least 6 characters."),
      }),
    []
  )

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  })

  return (
    <div className="flex min-h-svh">
      {/* Left side - Branded panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-neutral-900 lg:block">
        {/* Background photo */}
        <div className="absolute inset-0 bg-[url('/login-bg.jpg')] bg-cover bg-center" />
        {/* Accent gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F6BD02]/20 via-black/60 to-black/80" />

        {/* Marketing headline */}
        <div className="absolute left-10 top-12 z-10 max-w-2xl">
          <h1 className="text-3xl font-medium leading-[1.15] text-white md:text-4xl">
            Build, manage, and monitor email cadences with real-time workflows.
          </h1>
        </div>

        {/* Center icon/illustration */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-6 text-white/60">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="h-24 w-24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
            <p className="text-sm tracking-wide text-white/40">Email Cadence Assessment</p>
          </div>
        </div>

        {/* Bottom-left brand */}
        <div className="absolute bottom-10 left-10 z-10 flex items-center gap-3 text-white">
          <Shape59 className="text-[#F6BD02]" width={18} height={18} />
          <div className="text-xl font-semibold leading-none tracking-tight">
            Cadence
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-8 py-12 lg:w-1/2">
        <div className="w-full max-w-xs">
          <div className="flex min-h-[620px] flex-col">
            {/* Header */}
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold">Login your account</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="#" className="font-medium text-foreground hover:underline">
                  Create an Account
                </Link>
              </p>
            </div>

            {/* Form */}
            {!mounted ? (
              <form className="flex flex-col gap-4">
                <Input
                  placeholder="Username or Email"
                  type="email"
                  autoComplete="email"
                  className="h-11"
                  disabled
                />
                <div className="relative">
                  <Input
                    placeholder="Password"
                    type="password"
                    autoComplete="current-password"
                    className="h-11 pr-10"
                    disabled
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <EyeSlashIcon className="h-4 w-4" />
                  </span>
                </div>
                <Button
                  type="button"
                  className="h-11 w-full bg-foreground text-background hover:bg-foreground/90"
                  disabled
                >
                  Log in
                </Button>
              </form>
            ) : (
              <Form {...form}>
                <form
                  className="flex flex-col gap-4"
                  onSubmit={form.handleSubmit(async (values) => {
                    setMockSession({
                      userId: "user-001",
                      email: values.email,
                      name: "Demo User",
                      role: "admin",
                      createdAt: new Date().toISOString(),
                    })

                    toast.success("Signed in")
                    router.replace(sanitizeNext(next))
                  })}
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Username or Email"
                            type="email"
                            autoComplete="email"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Password"
                              type={showPassword ? "text" : "password"}
                              autoComplete="current-password"
                              className="h-11 pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              <EyeSlashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="h-11 w-full bg-foreground text-background hover:bg-foreground/90"
                  >
                    Log in
                  </Button>
                </form>
              </Form>
            )}

            {/* Hint text */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Demo app &mdash; enter any email and password to sign in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
