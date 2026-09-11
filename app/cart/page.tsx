"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Tag,
  CheckCircle2,
  AlertCircle,
  Truck,
  Cake,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth, useCart } from "@/components/providers/store-provider"

export default function CartPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { items, subtotal, updateQuantity, removeFromCart, clearCart, loading } = useCart()

  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    discountAmount: number
  } | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponMessage, setCouponMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponCode.trim()) return

    setCouponLoading(true)
    setCouponMessage(null)

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          subtotal,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setAppliedCoupon({
          code: data.data.code,
          discountAmount: data.data.discountAmount,
        })
        setCouponMessage({ type: "success", text: data.message })
        // Save in sessionStorage for checkout
        sessionStorage.setItem("appliedCouponCode", data.data.code)
      } else {
        setAppliedCoupon(null)
        setCouponMessage({ type: "error", text: data.message || "Invalid coupon" })
        sessionStorage.removeItem("appliedCouponCode")
      }
    } catch {
      setCouponMessage({ type: "error", text: "Failed to validate coupon." })
    } finally {
      setCouponLoading(false)
    }
  }

  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0
  const deliveryFee = subtotal > 799 || subtotal === 0 ? 0 : 50
  const total = Math.max(0, subtotal - discount + deliveryFee)

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50/50 py-16 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-pink-100 shadow-sm max-w-md w-full text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-pink-100 text-pink-600 mx-auto flex items-center justify-center">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-900">Sign in to view your Cart</h2>
          <p className="text-xs text-slate-500">
            Please log in to your account to view your saved bakery items and proceed to checkout.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/login?redirect=/cart">
              <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-full">
                Log In to Account
              </Button>
            </Link>
            <Link href="/cakes">
              <Button variant="ghost" className="w-full text-slate-600 rounded-full">
                Browse Cakes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50/50 py-4 md:py-6">
      <div className="w-[95%] max-w-[1440px] mx-auto px-3 sm:px-6">
        {/* Header */}
        <div className="mb-3">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
            Your Shopping Bag
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review your delicious selections before scheduling fresh delivery.
          </p>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Items List */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 md:p-8 border border-pink-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-pink-100">
                <span className="font-serif font-bold text-lg text-slate-900">
                  Selected Cakes ({items.length})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-full"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear Bag
                </Button>
              </div>

              {/* Items */}
              <div className="divide-y divide-pink-50">
                {items.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-pink-50 shrink-0 border border-pink-100">
                        <Image
                          src={item.product?.image || "/images/cakes/chocolate-truffle.jpg"}
                          alt={item.product?.name || "Cake"}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        {item.product?.category && (
                          <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider">
                            {item.product.category.name}
                          </span>
                        )}
                        <Link href={`/cakes/${item.product?.slug}`} className="hover:text-pink-600 transition-colors">
                          <h4 className="font-serif font-bold text-base text-slate-900">
                            {item.product?.name}
                          </h4>
                        </Link>
                        <p className="text-xs font-semibold text-slate-700">
                          ₹{item.price} each
                        </p>
                      </div>
                    </div>

                    {/* Quantity & Delete Controls */}
                    <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-pink-50">
                      <div className="flex items-center border border-pink-200 rounded-full bg-white p-1">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="h-7 w-7 rounded-full hover:bg-pink-50 flex items-center justify-center text-slate-600 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center font-bold text-xs text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="h-7 w-7 rounded-full hover:bg-pink-50 flex items-center justify-center text-slate-600 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-base font-bold text-slate-900">
                          ₹{item.total}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-pink-100 flex items-center justify-between text-xs text-slate-500">
                <Link href="/cakes" className="text-pink-600 font-semibold hover:underline">
                  ← Continue Shopping
                </Link>
                <span>Free delivery on orders above ₹799</span>
              </div>
            </div>

            {/* Summary Column */}
            <div className="lg:col-span-4 space-y-6">
              {/* Order Summary Box */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-pink-100 shadow-sm space-y-5">
                <h3 className="font-serif font-bold text-xl text-slate-900 pb-3 border-b border-pink-100">
                  Order Summary
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">₹{subtotal}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex items-center justify-between text-rose-600">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span className="font-bold">-₹{discount}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5 text-pink-600" /> Delivery Fee
                    </span>
                    <span className="font-bold text-slate-900">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-600 font-semibold">FREE</span>
                      ) : (
                        `₹${deliveryFee}`
                      )}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-pink-100 flex items-center justify-between text-base">
                    <span className="font-serif font-bold text-slate-900">Total Amount</span>
                    <span className="font-bold text-2xl text-pink-600">₹{total}</span>
                  </div>
                </div>

                {/* Promo Code Form */}
                <form onSubmit={handleApplyCoupon} className="pt-3 border-t border-pink-100 space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-pink-600" /> Have a Coupon?
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="e.g. WELCOME10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="h-10 text-xs rounded-full border-pink-200"
                    />
                    <Button
                      type="submit"
                      disabled={couponLoading || !couponCode.trim()}
                      className="bg-pink-600 hover:bg-pink-700 text-white rounded-full text-xs px-5 h-10 font-semibold shrink-0"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </Button>
                  </div>
                  {couponMessage && (
                    <div
                      className={`p-2 rounded-xl text-xs flex items-center gap-1.5 ${
                        couponMessage.type === "success"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {couponMessage.type === "success" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      )}
                      {couponMessage.text}
                    </div>
                  )}
                </form>

                {/* Checkout Button */}
                <Button
                  size="lg"
                  onClick={() => router.push("/checkout")}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-full h-12 font-bold shadow-md hover:shadow-lg transition-all"
                >
                  Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* Security & Safe Packing Notice */}
              <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 text-xs text-slate-600 space-y-1 text-center">
                <p className="font-semibold text-slate-800">
                  🎂 Baked with 100% Love & Care
                </p>
                <p>Delivered in sanitized temperature-controlled bakery boxes.</p>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Bag */
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-pink-100 text-center max-w-md mx-auto my-12 shadow-sm space-y-4">
            <div className="h-20 w-20 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <h3 className="font-serif font-bold text-2xl text-slate-900">
              Your bag is empty
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Looks like you haven't added any delicious cakes yet. Browse our freshly baked menu to get started!
            </p>
            <Link href="/cakes">
              <Button className="bg-pink-600 hover:bg-pink-700 text-white rounded-full text-xs px-8 h-10 font-semibold shadow-sm">
                Explore Cakes Now
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
