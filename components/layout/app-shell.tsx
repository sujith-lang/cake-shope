"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar/navbar"
import Footer from "@/components/footer/footer"

// Authentication routes that should show ONLY authentication content, without website layout
const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isAuthPage = AUTH_ROUTES.some(
    (route) => pathname === route || pathname?.startsWith(route + "/")
  )
  const isAdminPage = pathname?.startsWith("/admin")

  // On Login, Register, and other Auth pages: hide website Navbar and Footer completely
  if (isAuthPage) {
    return (
      <main className="min-h-screen w-full flex flex-col">
        {children}
      </main>
    )
  }

  // On Admin dashboard pages: AdminLayout manages its own dedicated sidebar navigation
  if (isAdminPage) {
    return (
      <main className="min-h-screen w-full flex flex-col">
        {children}
      </main>
    )
  }

  // On standard storefront pages: render full normal website layout (Navbar + Content + Footer)
  return (
    <>
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </>
  )
}
