"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Cake, Mail, ArrowRight, CheckCircle2, Loader2, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [resetUrl, setResetUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to process request. Please try again.")
        setLoading(false)
        return
      }

      setSubmitted(true)
      if (data.resetUrl) {
        setResetUrl(data.resetUrl)
      }
    } catch {
      setError("Network error. Please try again.")
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
          <h1 className="text-2xl font-bold font-serif tracking-tight">Forgot Password</h1>
          <p className="text-xs text-rose-100 mt-1">Reset your Sweet Delights account password</p>
        </div>

        <CardHeader className="text-center pt-6 pb-2">
          <CardTitle className="text-xl font-serif text-stone-900 dark:text-stone-100">
            Account Recovery
          </CardTitle>
          <CardDescription className="text-xs text-stone-500 dark:text-stone-400">
            Enter your email address and we will generate instructions to reset your password.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-4">
          {submitted ? (
            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs text-center space-y-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <p className="font-bold text-sm">Reset Instructions Generated!</p>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                If an account exists for <span className="font-semibold text-stone-800 dark:text-stone-200">{email}</span>, a secure password reset link has been dispatched.
              </p>

              {/* Dev/Demo Helper: direct button to continue with generated token */}
              {resetUrl && (
                <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 mt-3">
                  <p className="text-[11px] text-stone-500 mb-2 font-medium">Quick link for local development:</p>
                  <Link href={resetUrl}>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs h-9">
                      Proceed to Reset Password
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Account Email Address
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
                    className="pl-10 h-11 text-xs rounded-xl border-stone-200 dark:border-stone-700 focus-visible:ring-rose-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-150 gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col items-center justify-center p-5 bg-stone-50/60 dark:bg-stone-800/40 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500">
          <p>
            Remembered your password?{" "}
            <Link href="/login" className="text-rose-600 font-bold hover:underline ml-1">
              Back to Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
