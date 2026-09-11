"use client"

import React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  User,
  Package,
  MapPin,
  Heart,
  Settings,
  LogOut,
  ShieldAlert,
  Cake,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/store-provider"

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, logout } = useAuth()

  React.useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [loading, user, pathname, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen py-20 text-center text-slate-500">
        Loading account...
      </div>
    )
  }

  const navLinks = [
    { href: "/account", label: "Overview", icon: User },
    { href: "/account/orders", label: "My Orders", icon: Package },
    { href: "/account/addresses", label: "Addresses", icon: MapPin },
    { href: "/account/wishlist", label: "My Wishlist", icon: Heart },
    { href: "/account/profile", label: "Profile Settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-stone-50/50 py-4 md:py-6">
      <div className="w-[95%] max-w-[1440px] mx-auto px-3 sm:px-6">
        {/* User Greeting Banner */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 md:p-6 border border-pink-100 shadow-sm mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-serif font-bold text-xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-slate-900">
                Welcome, {user.name}
              </h1>
              <p className="text-xs text-slate-500">{user.email} • {user.role}</p>
            </div>
          </div>

          {user.role === "ADMIN" && (
            <Link href="/admin">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs font-semibold h-8 px-3">
                <ShieldAlert className="h-3.5 w-3.5 mr-1.5" /> Open Admin Portal
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-4 border border-pink-100 shadow-sm space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-pink-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-pink-50 hover:text-pink-600"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              )
            })}

            <div className="pt-2 mt-2 border-t border-pink-50">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all text-left"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Main Account Area Content */}
          <div className="lg:col-span-9">{children}</div>
        </div>
      </div>
    </div>
  )
}
