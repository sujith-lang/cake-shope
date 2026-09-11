"use client"

import React, { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Cake, Loader2, Lock, Mail, ArrowRight, Eye, EyeOff, ArrowLeft, Sparkles, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { useAuth } from "@/components/providers/store-provider"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get("redirect")
  const { refreshUser } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || "Invalid email or password.")
        setLoading(false)
        return
      }

      // Refresh auth state in provider
      await refreshUser()

      // Redirect user:
      // If ADMIN -> ALWAYS go directly to /admin
      // If CUSTOMER -> redirect to redirect param, or /account, or /
      if (data.data?.role === "ADMIN") {
        router.push("/admin")
      } else if (redirectParam && !redirectParam.startsWith("/admin")) {
        router.push(redirectParam)
      } else {
        router.push("/account")
      }
    } catch {
      setError("Unable to connect to the server. Please check your connection.")
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center px-4 py-8 sm:px-6 overflow-hidden bg-gradient-to-br from-[#fef5f7] via-[#faf7f5] to-[#fff4ec] dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      {/* Decorative ambient background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden="true">
        {/* Soft blurred gradient circles */}
        <div className="absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-rose-300/35 via-pink-200/25 to-transparent blur-3xl" />
        <div className="absolute -bottom-28 -right-20 w-[460px] h-[460px] rounded-full bg-gradient-to-tl from-amber-200/40 via-rose-200/25 to-transparent blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-pink-100/30 via-rose-100/20 to-amber-100/25 dark:bg-rose-950/10 blur-3xl" />

        {/* Subtle decorative floating abstract glass shapes (desktop/tablet) */}
        <div className="absolute top-16 right-[14%] hidden md:flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/50 dark:bg-stone-800/40 border border-white/80 dark:border-stone-700/50 backdrop-blur-md shadow-xs rotate-3 animate-pulse" style={{ animationDuration: '6s' }}>
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span className="text-[11px] font-medium text-stone-600 dark:text-stone-300">Freshly Baked Daily</span>
        </div>

        <div className="absolute bottom-16 left-[12%] hidden md:flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/50 dark:bg-stone-800/40 border border-white/80 dark:border-stone-700/50 backdrop-blur-md shadow-xs -rotate-3 animate-pulse" style={{ animationDuration: '8s' }}>
          <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500/20" />
          <span className="text-[11px] font-medium text-stone-600 dark:text-stone-300">Handcrafted With Love</span>
        </div>

        {/* Subtle geometric background dots & orbs */}
        <div className="absolute top-1/3 left-[8%] hidden lg:block w-3 h-3 rounded-full bg-rose-400/25 blur-[1px]" />
        <div className="absolute bottom-1/3 right-[9%] hidden lg:block w-4 h-4 rounded-full bg-amber-400/30 blur-[1px]" />
        <div className="absolute top-1/4 right-[8%] hidden xl:block w-2.5 h-2.5 rounded-full bg-pink-400/20" />
      </div>

      {/* Main Authentication Card Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Back to Bakery navigation */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors bg-white/60 dark:bg-stone-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-200/50 dark:border-stone-800 shadow-2xs hover:shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sweet Delights</span>
          </Link>
        </div>

        <Card className="w-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl rounded-3xl border border-white/90 dark:border-stone-800 shadow-[0_20px_50px_rgba(244,63,94,0.10)] dark:shadow-stone-950/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Brand Header */}
          <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 p-6 text-white text-center relative shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner ring-1 ring-white/30">
              <Cake className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold font-serif tracking-tight">Sweet Delights</h1>
            <p className="text-xs text-rose-100 mt-1">Artisan Bakery & Handcrafted Cakes</p>
          </div>

          <CardHeader className="text-center pt-6 pb-2">
            <CardTitle className="text-2xl font-serif text-stone-900 dark:text-stone-100 flex items-center justify-center gap-2">
              Welcome Back <span className="text-xl">🍰</span>
            </CardTitle>
            <CardDescription className="text-xs text-stone-500 dark:text-stone-400">
              Sign in to access your orders, wishlist, or baker dashboard
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 py-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
                  <span className="font-semibold">Error:</span> {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="pl-10 h-11 text-xs rounded-xl border-stone-200 dark:border-stone-700 bg-white/70 dark:bg-stone-800/70 focus-visible:ring-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="pl-10 pr-10 h-11 text-xs rounded-xl border-stone-200 dark:border-stone-700 bg-white/70 dark:bg-stone-800/70 focus-visible:ring-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none p-1 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-150 gap-2 mt-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-center p-5 bg-stone-50/70 dark:bg-stone-800/40 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500">
            <p>
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-rose-600 font-bold hover:underline ml-1">
                Create Account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#faf7f5]">
          <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
