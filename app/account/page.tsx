"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Package, MapPin, Heart, ArrowRight, Clock, Cake } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function AccountOverviewPage() {
  const [profile, setProfile] = useState<any>(null)
  const [recentOrder, setRecentOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [profRes, ordRes] = await Promise.all([
          fetch("/api/account/profile"),
          fetch("/api/orders"),
        ])
        const profData = await profRes.json()
        const ordData = await ordRes.json()

        if (profData.success) setProfile(profData.data)
        if (ordData.success && ordData.data.length > 0) {
          setRecentOrder(ordData.data[0])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-pink-100 shadow-sm text-center text-xs text-slate-400">
        Loading dashboard...
      </div>
    )
  }

  const orderCount = profile?._count?.orders || 0
  const addressCount = profile?._count?.addresses || 0
  const reviewCount = profile?._count?.reviews || 0

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/account/orders"
          className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Orders
            </p>
            <p className="text-3xl font-serif font-bold text-slate-900 mt-1">
              {orderCount}
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
            <Package className="h-6 w-6" />
          </div>
        </Link>

        <Link
          href="/account/addresses"
          className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Saved Addresses
            </p>
            <p className="text-3xl font-serif font-bold text-slate-900 mt-1">
              {addressCount}
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
            <MapPin className="h-6 w-6" />
          </div>
        </Link>

        <Link
          href="/account/wishlist"
          className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Product Reviews
            </p>
            <p className="text-3xl font-serif font-bold text-slate-900 mt-1">
              {reviewCount}
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
            <Heart className="h-6 w-6" />
          </div>
        </Link>
      </div>

      {/* Recent Order Preview */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-pink-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-pink-100">
          <h3 className="font-serif font-bold text-lg text-slate-900">
            Most Recent Order
          </h3>
          <Link href="/account/orders" className="text-xs font-semibold text-pink-600 hover:underline">
            View All Orders →
          </Link>
        </div>

        {recentOrder ? (
          <div className="space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-pink-50/50">
              <div>
                <span className="font-bold text-slate-900 text-sm">{recentOrder.orderNumber}</span>
                <p className="text-slate-500 mt-0.5">
                  Placed on {new Date(recentOrder.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-pink-600 text-white text-[11px] font-semibold px-2.5 py-0.5">
                  {recentOrder.status}
                </Badge>
                <span className="font-bold text-sm text-slate-900">
                  ₹{recentOrder.totalAmount}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-slate-700">Items Ordered:</p>
              <div className="divide-y divide-pink-50">
                {recentOrder.items.map((item: any) => (
                  <div key={item.id} className="py-2 flex items-center justify-between">
                    <span className="text-slate-800">
                      {item.quantity}x {item.productName}
                    </span>
                    <span className="font-bold text-slate-900">₹{item.total}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-slate-500 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-pink-600" />
              <span>
                Scheduled Delivery: {new Date(recentOrder.deliveryDate).toLocaleDateString()} ({recentOrder.deliveryTime})
              </span>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center space-y-3">
            <Cake className="h-10 w-10 text-pink-600 mx-auto" />
            <p className="text-xs text-slate-500">You haven't placed any orders yet.</p>
            <Link href="/cakes">
              <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white rounded-full text-xs">
                Explore Cakes Now
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
