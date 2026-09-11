"use client"

import React, { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { KeyRound, Lock, Loader2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!token) {
      setError("Reset token is missing. Please use the link sent to your email.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to reset password. The link may have expired.")
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch {
      setError("Network connection error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50/60 dark:bg-stone-950 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-linear-to-r from-rose-500 via-pink-500 to-rose-400 p-6 text-white text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold font-serif tracking-tight">Set New Password</h1>
          <p className="text-xs text-rose-100 mt-1">Create a secure password for your account</p>
        </div>

        <CardHeader className="text-center pt-6 pb-2">
          <CardTitle className="text-xl font-serif text-stone-900 dark:text-stone-100">
            Reset Password
          </CardTitle>
          <CardDescription className="text-xs text-stone-500 dark:text-stone-400">
            Enter your new password below to regain account access
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-4">
          {success ? (
            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs text-center space-y-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <p className="font-bold text-sm">Password Updated Successfully!</p>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                Your password has been updated and the reset link has been retired. You can now sign in with your new credentials.
              </p>
              <div className="pt-2">
                <Link href="/login">
                  <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs h-10 font-semibold gap-2">
                    <span>Sign In Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!token && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>No reset token detected in URL. Please use the exact link from your email or forgot password request.</span>
                </div>
              )}

              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  New Password <span className="text-stone-400 font-normal">(min. 8 characters)</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading || !token}
                    className="pl-10 h-11 text-xs rounded-xl border-stone-200 dark:border-stone-700 focus-visible:ring-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading || !token}
                    className="pl-10 h-11 text-xs rounded-xl border-stone-200 dark:border-stone-700 focus-visible:ring-rose-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !token}
                className="w-full h-11 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-150 gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Update Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col items-center justify-center p-5 bg-stone-50/60 dark:bg-stone-800/40 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500">
          <Link href="/login" className="text-rose-600 font-bold hover:underline">
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-stone-50/60">
          <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
