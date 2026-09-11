import React from "react"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminSidebar from "./admin-sidebar"

export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  // Server-side authentication check
  if (!session) {
    redirect("/login?redirect=/admin")
  }

  // Server-side authorization check (Admins only)
  if (session.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      <AdminSidebar session={session} />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-slate-900">
        {children}
      </main>
    </div>
  )
}
