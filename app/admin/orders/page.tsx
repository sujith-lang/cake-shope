"use client"

import React, { useEffect, useState } from "react"
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Calendar,
  MapPin,
  Clock,
  User,
  Truck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "BAKING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/orders?all=true")
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

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSuccessMsg(`Order status updated to ${newStatus}`)
        await fetchOrders()
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus })
        }
        setTimeout(() => setSuccessMsg(null), 3500)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusBadgeClass = (st: string) => {
    switch (st) {
      case "DELIVERED":
        return "bg-emerald-950/60 text-emerald-300 border-emerald-800"
      case "OUT_FOR_DELIVERY":
        return "bg-blue-950/60 text-blue-300 border-blue-800"
      case "BAKING":
      case "READY":
        return "bg-purple-950/60 text-purple-300 border-purple-800"
      case "CONFIRMED":
        return "bg-sky-950/60 text-sky-300 border-sky-800"
      case "CANCELLED":
        return "bg-rose-950/60 text-rose-300 border-rose-800"
      default:
        return "bg-amber-950/60 text-amber-300 border-amber-800"
    }
  }

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === "all" || o.status === statusFilter
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      o.address?.phone?.includes(search)
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
          Order Processing & Kitchen Status
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Track customer bakery orders from PENDING through BAKING, READY, and OUT_FOR_DELIVERY.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <Input
            type="text"
            placeholder="Search order #, customer, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-slate-900 border-slate-800 text-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-400">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            {ORDER_STATUSES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/50">
                <th className="p-4 font-semibold">Order #</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Items</th>
                <th className="p-4 font-semibold">Total Amount</th>
                <th className="p-4 font-semibold">Delivery Schedule</th>
                <th className="p-4 font-semibold">Status Workflow</th>
                <th className="p-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-900/60">
                    <td className="p-4 font-mono font-bold text-white">
                      {order.orderNumber}
                      <p className="text-[10px] text-slate-500 font-sans font-normal mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-white">{order.user?.name || "Customer"}</p>
                      <p className="text-[11px] text-slate-400">{order.address?.phone}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-slate-200">
                        {order.items?.length || 0} cakes
                      </span>
                    </td>
                    <td className="p-4 font-bold text-white">
                      ₹{order.totalAmount}
                      <p className="text-[10px] text-slate-400 font-normal">
                        {order.paymentMethod}
                      </p>
                    </td>
                    <td className="p-4 text-slate-300">
                      <p className="font-medium">{new Date(order.deliveryDate).toLocaleDateString()}</p>
                      <p className="text-[11px] text-slate-500">{order.deliveryTime}</p>
                    </td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer ${getStatusBadgeClass(order.status)}`}
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st} value={st} className="bg-slate-900 text-white font-normal">
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedOrder(order)}
                        className="h-8 text-xs text-purple-400 hover:text-purple-300 hover:bg-slate-800 rounded-lg"
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No orders found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="bg-slate-950 text-slate-100 border border-slate-800 max-w-lg p-6 rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-serif font-bold text-xl text-white flex items-center justify-between">
                <span>Order: {selectedOrder.orderNumber}</span>
                <Badge className={getStatusBadgeClass(selectedOrder.status)}>
                  {selectedOrder.status}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              {/* Customer & Address */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <p className="font-bold text-slate-200">Customer & Delivery Recipient</p>
                <p className="text-white text-sm font-semibold">{selectedOrder.address?.name}</p>
                <p className="text-slate-400">Phone: {selectedOrder.address?.phone}</p>
                <p className="text-slate-400">
                  Address: {selectedOrder.address?.addressLine1}, {selectedOrder.address?.addressLine2 && `${selectedOrder.address.addressLine2}, `}
                  {selectedOrder.address?.city}, {selectedOrder.address?.state} - {selectedOrder.address?.postalCode}
                </p>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <p className="font-bold text-slate-200">Items Ordered:</p>
                <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl p-3 bg-slate-900">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{item.productName}</p>
                        <p className="text-slate-400 text-[11px]">
                          Qty: {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                      <span className="font-bold text-white">₹{item.total}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-rose-400">
                    <span>Discount</span>
                    <span>-₹{selectedOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span>₹{selectedOrder.deliveryCharge}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-sm pt-1 border-t border-slate-800">
                  <span>Total Amount</span>
                  <span className="text-pink-400">₹{selectedOrder.totalAmount}</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="p-3 bg-purple-950/40 border border-purple-900 rounded-xl text-purple-200">
                  <strong>Notes / Inscription:</strong> "{selectedOrder.notes}"
                </div>
              )}

              {/* Quick Status Changer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Change Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs cursor-pointer focus:outline-none"
                >
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st} className="bg-slate-900 text-white font-normal">
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
