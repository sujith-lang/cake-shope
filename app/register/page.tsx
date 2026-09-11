"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Cake, Loader2, Lock, Mail, User, Phone, ArrowRight, Eye, EyeOff, ArrowLeft, Award, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { useAuth } from "@/components/providers/store-provider"

export default function RegisterPage() {
  const router = useRouter()
  const { refreshUser } = useAuth()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Frontend validation
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || "Registration failed. Please try again.")
        setLoading(false)
        return
      }

      // Update auth context state
      await refreshUser()

      // Redirect customer to account or homepage
      router.push("/account")
    } catch {
      setError("Network connection error. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center px-4 py-8 sm:px-6 overflow-hidden bg-gradient-to-br from-[#fdf2f7] via-[#faf7f5] to-[#fef6ee] dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      {/* Decorative ambient background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden="true">
        {/* Soft blurred gradient circles */}
        <div className="absolute -top-28 -right-20 w-[450px] h-[450px] rounded-full bg-gradient-to-bl from-pink-300/35 via-rose-300/20 to-transparent blur-3xl" />
        <div className="absolute -bottom-28 -left-20 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-orange-200/35 via-rose-200/25 to-transparent blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[620px] rounded-full bg-gradient-to-r from-pink-100/35 via-rose-100/20 to-orange-100/25 dark:bg-pink-950/10 blur-3xl" />

        {/* Subtle decorative floating abstract glass shapes (desktop/tablet) */}
        <div className="absolute top-20 left-[12%] hidden md:flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/50 dark:bg-stone-800/40 border border-white/80 dark:border-stone-700/50 backdrop-blur-md shadow-xs -rotate-3 animate-pulse" style={{ animationDuration: '7s' }}>
          <Award className="w-3.5 h-3.5 text-rose-500" />
          <span className="text-[11px] font-medium text-stone-600 dark:text-stone-300">100% Pure Dairy Butter</span>
        </div>

        <div className="absolute bottom-20 right-[12%] hidden md:flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/50 dark:bg-stone-800/40 border border-white/80 dark:border-stone-700/50 backdrop-blur-md shadow-xs rotate-3 animate-pulse" style={{ animationDuration: '9s' }}>
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[11px] font-medium text-stone-600 dark:text-stone-300">Bespoke Custom Designs</span>
        </div>

        {/* Subtle geometric background dots & orbs */}
        <div className="absolute top-1/4 right-[9%] hidden lg:block w-3 h-3 rounded-full bg-pink-400/25 blur-[1px]" />
        <div className="absolute bottom-1/4 left-[9%] hidden lg:block w-4 h-4 rounded-full bg-rose-400/30 blur-[1px]" />
        <div className="absolute top-1/3 left-[7%] hidden xl:block w-2.5 h-2.5 rounded-full bg-orange-400/20" />
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
            <p className="text-xs text-rose-100 mt-1">Join our sweet family today</p>
          </div>

          <CardHeader className="text-center pt-5 pb-2">
            <CardTitle className="text-2xl font-serif text-stone-900 dark:text-stone-100">
              Create an Account
            </CardTitle>
            <CardDescription className="text-xs text-stone-500 dark:text-stone-400">
              Order fresh artisanal cakes, track deliveries, and save favorite treats
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 py-4">
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
                  <span className="font-semibold">Error:</span> {error}
                </div>
              )}

              {/* Name */}
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                    className="pl-10 h-10 text-xs rounded-xl border-stone-200 dark:border-stone-700 bg-white/70 dark:bg-stone-800/70 focus-visible:ring-rose-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className="pl-10 h-10 text-xs rounded-xl border-stone-200 dark:border-stone-700 bg-white/70 dark:bg-stone-800/70 focus-visible:ring-rose-500"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <Label htmlFor="phone" className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Phone Number <span className="text-stone-400 font-normal">(Optional)</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                    className="pl-10 h-10 text-xs rounded-xl border-stone-200 dark:border-stone-700 bg-white/70 dark:bg-stone-800/70 focus-visible:ring-rose-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Password <span className="text-stone-400 font-normal">(min. 8 characters)</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    className="pl-10 pr-10 h-10 text-xs rounded-xl border-stone-200 dark:border-stone-700 bg-white/70 dark:bg-stone-800/70 focus-visible:ring-rose-500"
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

              {/* Confirm Password */}
              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className="pl-10 pr-10 h-10 text-xs rounded-xl border-stone-200 dark:border-stone-700 bg-white/70 dark:bg-stone-800/70 focus-visible:ring-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none p-1 transition-colors"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-150 gap-2 mt-4 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-center p-5 bg-stone-50/70 dark:bg-stone-800/40 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500">
            <p>
              Already have an account?{" "}
              <Link href="/login" className="text-rose-600 font-bold hover:underline ml-1">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
