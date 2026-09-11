"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import {
  DollarSign,
  ShoppingBag,
  Cake,
  Users,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/stats")
        const json = await res.json()
        if (json.success) {
          setStats(json.data)
        }
      } catch (err) {
        console.error("Admin stats fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading) {
    return <div className="text-slate-400 text-xs">Loading analytics dashboard...</div>
  }

  const metricCards = [
    {
      title: "Total Revenue",
      value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`,
      subtitle: "Gross sales (active orders)",
      icon: DollarSign,
      color: "text-emerald-400 bg-emerald-950/40 border-emerald-800/40",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      subtitle: "Processed in system",
      icon: ShoppingBag,
      color: "text-blue-400 bg-blue-950/40 border-blue-800/40",
    },
    {
      title: "Active Cakes",
      value: stats?.totalProducts || 0,
      subtitle: "Listed in catalog",
      icon: Cake,
      color: "text-pink-400 bg-pink-950/40 border-pink-800/40",
    },
    {
      title: "Customers",
      value: stats?.totalCustomers || 0,
      subtitle: "Registered profiles",
      icon: Users,
      color: "text-purple-400 bg-purple-950/40 border-purple-800/40",
    },
  ]

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Bakery Operations Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time bakery performance, order workflows, and catalog analytics.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/products">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold">
              + New Cake
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl text-xs">
              Manage Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metricCards.map((card, i) => {
          const Icon = card.icon
          return (
            <div
              key={i}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between shadow-sm"
            >
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-400">{card.title}</p>
                <p className="text-2xl font-serif font-bold text-white">{card.value}</p>
                <p className="text-[11px] text-slate-500">{card.subtitle}</p>
              </div>
              <div className={`h-12 w-12 rounded-xl border flex items-center justify-center ${card.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Pending Custom Cakes Alert */}
      {stats?.pendingCustomCakes > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-amber-400 shrink-0" />
            <span>
              You have <strong className="text-amber-100">{stats.pendingCustomCakes} pending custom cake inquiries</strong> awaiting chef quote and review.
            </span>
          </div>
          <Link href="/admin/custom-cakes">
            <Button size="sm" variant="outline" className="text-xs border-amber-700 hover:bg-amber-900/50 text-amber-200 rounded-lg h-8">
              Review Now
            </Button>
          </Link>
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="font-serif font-bold text-lg text-white">
            Recent Orders
          </h2>
          <Link href="/admin/orders" className="text-xs text-purple-400 hover:underline">
            View All Orders →
          </Link>
        </div>

        {stats?.recentOrders?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="pb-3 font-semibold">Order Number</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {stats.recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-900/60">
                    <td className="py-3 font-mono font-semibold text-white">{order.orderNumber}</td>
                    <td className="py-3">{order.user?.name || "Customer"}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-white">₹{order.totalAmount}</td>
                    <td className="py-3 text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <Link href="/admin/orders">
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-purple-400 hover:text-purple-300 hover:bg-slate-800">
                          Update Status
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            No orders processed yet.
          </div>
        )}
      </div>
    </div>
  )
}
