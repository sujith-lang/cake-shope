"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import {
  Package,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Truck,
  Cake,
  Calendar,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function AccountOrdersPage() {
  const searchParams = useSearchParams()
  const isSuccess = searchParams.get("success") === "true"
  const newOrderNumber = searchParams.get("order")

  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders")
        const data = await res.json()
        if (data.success) {
          setOrders(data.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "OUT_FOR_DELIVERY":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "BAKING":
      case "READY":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "CONFIRMED":
        return "bg-sky-100 text-sky-800 border-sky-200"
      case "CANCELLED":
        return "bg-rose-100 text-rose-800 border-rose-200"
      default:
        return "bg-amber-100 text-amber-800 border-amber-200"
    }
  }

  return (
    <div className="space-y-6">
      {isSuccess && (
        <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold text-sm">Thank you! Your order was placed successfully.</p>
            <p className="text-emerald-700 mt-0.5">
              Order Number: <span className="font-mono font-bold">{newOrderNumber}</span>. Our kitchen has received your order and started preparations!
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-pink-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-pink-100">
          <h2 className="font-serif font-bold text-xl text-slate-900">
            My Order History ({orders.length})
          </h2>
          <Link href="/cakes">
            <Button variant="outline" size="sm" className="rounded-full text-xs border-pink-200 text-pink-700">
              Order Another Cake
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading orders...</div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-5 md:p-6 rounded-2xl border border-pink-100 bg-stone-50/50 space-y-4 text-xs"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pink-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {order.orderNumber}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-slate-500">
                      Ordered on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <span className="font-bold text-lg text-slate-900">
                      ₹{order.totalAmount}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {order.paymentMethod} ({order.paymentStatus})
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-pink-100">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="py-2.5 first:pt-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-pink-100 shrink-0 border border-pink-100">
                          <Image
                            src={item.product?.image || "/images/cakes/chocolate-truffle.jpg"}
                            alt={item.productName}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-serif font-bold text-slate-900">
                            {item.productName}
                          </p>
                          <p className="text-slate-500 text-[11px]">
                            Qty: {item.quantity} × ₹{item.price}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-800">₹{item.total}</span>
                    </div>
                  ))}
                </div>

                {/* Delivery details & notes */}
                <div className="pt-3 border-t border-pink-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600 bg-white p-3 rounded-xl">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-pink-600" /> Scheduled Delivery
                    </p>
                    <p>{new Date(order.deliveryDate).toLocaleDateString()} • {order.deliveryTime}</p>
                    {order.notes && (
                      <p className="text-pink-600 italic mt-1 font-medium">
                        Notes: "{order.notes}"
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-pink-600" /> Delivery Address
                    </p>
                    <p className="truncate">
                      {order.address?.name}, {order.address?.addressLine1}, {order.address?.city} ({order.address?.postalCode})
                    </p>
                    <p className="text-slate-500">Contact: {order.address?.phone}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <Package className="h-12 w-12 text-pink-600 mx-auto" />
            <h3 className="font-serif font-bold text-lg text-slate-900">No orders placed yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Once you place an order for our fresh artisan cakes, you can track baking status and delivery right here.
            </p>
            <Link href="/cakes">
              <Button className="bg-pink-600 hover:bg-pink-700 text-white rounded-full text-xs mt-2">
                Order Your First Cake
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
