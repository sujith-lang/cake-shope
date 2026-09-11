"use client"

import React, { useEffect, useState } from "react"
import { Users, Search, Mail, Phone, Calendar, ShoppingBag } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await fetch("/api/admin/customers")
        const data = await res.json()
        if (data.success) {
          setCustomers(data.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchCustomers()
  }, [])

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  )

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
          Registered Customers ({customers.length})
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Directory of registered customer profiles, total orders placed, and custom cake inquiries.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <Input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-slate-900 border-slate-800 text-white"
          />
        </div>
      </div>

      <div className="rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/50">
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold">Joined Date</th>
                <th className="p-4 font-semibold">Orders Placed</th>
                <th className="p-4 font-semibold">Custom Inquiries</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading customer directory...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-900/60">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-purple-950 border border-purple-800 text-purple-300 font-bold flex items-center justify-center">
                          {cust.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-semibold text-white">{cust.name}</p>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 space-y-0.5">
                      <p className="text-slate-200">{cust.email}</p>
                      <p className="text-[11px]">{cust.phone || "No phone provided"}</p>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(cust.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold text-white">
                      {cust._count?.orders || 0} orders
                    </td>
                    <td className="p-4 font-medium text-slate-300">
                      {cust._count?.customCakeRequests || 0} requests
                    </td>
                    <td className="p-4">
                      <Badge className={cust.isActive ? "bg-emerald-950/60 text-emerald-300 border-emerald-800" : "bg-rose-950/60 text-rose-300 border-rose-800"}>
                        {cust.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No customers found matching search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
