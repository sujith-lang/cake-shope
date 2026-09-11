"use client"

import React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Cake,
  FolderTree,
  ShoppingBag,
  Users,
  Star,
  Tag,
  Sparkles,
  Mail,
  ArrowLeft,
  ShieldAlert,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/store-provider"
import { SessionPayload } from "@/lib/auth"

export default function AdminSidebar({ session }: { session: SessionPayload }) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const adminNav = [
    { href: "/admin", label: "Dashboard Overview", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products & Cakes", icon: Cake },
    { href: "/admin/categories", label: "Categories", icon: FolderTree },
    { href: "/admin/orders", label: "Orders Management", icon: ShoppingBag },
    { href: "/admin/customers", label: "Registered Customers", icon: Users },
    { href: "/admin/reviews", label: "Review Moderation", icon: Star },
    { href: "/admin/coupons", label: "Coupons & Discounts", icon: Tag },
    { href: "/admin/custom-cakes", label: "Custom Cake Inquiries", icon: Sparkles },
    { href: "/admin/contact", label: "Contact Messages", icon: Mail },
  ]

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-5 shrink-0 flex flex-col justify-between">
      <div className="space-y-6">
        {/* Logo / Admin Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <span className="font-serif font-bold text-lg text-white">
              Admin<span className="text-purple-400">Portal</span>
            </span>
          </div>
          <Link href="/" title="View Public Storefront">
            <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-white rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {adminNav.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-purple-600 text-white font-semibold shadow-xs"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Admin User Footer */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <div className="px-2">
          <p className="text-xs font-semibold text-white truncate">{session.name || "Administrator"}</p>
          <p className="text-[11px] text-slate-400 truncate">{session.email}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800">
              Store
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            title="Sign out of administrator portal"
            className="text-xs border-slate-700 bg-slate-900 text-rose-400 hover:bg-rose-950/40"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
