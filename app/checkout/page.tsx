"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Truck,
  Plus,
  ArrowRight,
  ShieldCheck,
  Cake,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth, useCart } from "@/components/providers/store-provider"

interface Address {
  id: string
  name: string
  phone: string
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  postalCode: string
  isDefault: boolean
}

const TIME_SLOTS = [
  "Standard Morning (9:00 AM - 1:00 PM)",
  "Standard Afternoon (1:00 PM - 5:00 PM)",
  "Standard Evening (5:00 PM - 9:00 PM)",
  "Midnight Surprise (11:30 PM - 12:00 AM)",
]

export default function CheckoutPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { items, subtotal, refreshCart } = useCart()

  // State
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [deliveryDate, setDeliveryDate] = useState<string>("")
  const [deliveryTime, setDeliveryTime] = useState<string>(TIME_SLOTS[1])
  const [notes, setNotes] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash on Delivery")
  const [couponCode, setCouponCode] = useState<string>("")
  const [discountAmount, setDiscountAmount] = useState<number>(0)

  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [submittingOrder, setSubmittingOrder] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)

  // New Address modal state
  const [newAddressOpen, setNewAddressOpen] = useState(false)
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
  })
  const [savingAddress, setSavingAddress] = useState(false)

  // Initialize minimum delivery date (tomorrow by default)
  useEffect(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setDeliveryDate(tomorrow.toISOString().split("T")[0])

    // Read stored coupon from cart page
    const storedCoupon = sessionStorage.getItem("appliedCouponCode")
    if (storedCoupon) {
      setCouponCode(storedCoupon)
      // re-validate
      fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: storedCoupon, subtotal }),
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.success) setDiscountAmount(json.data.discountAmount)
        })
        .catch(console.error)
    }
  }, [subtotal])

  // Fetch Addresses
  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true)
      const res = await fetch("/api/account/addresses")
      const data = await res.json()
      if (res.ok && data.success) {
        setAddresses(data.data)
        const defaultAddr = data.data.find((a: Address) => a.isDefault) || data.data[0]
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingAddresses(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchAddresses()
    }
  }, [user])

  // Handle Add Address
  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingAddress(true)
    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newAddress,
          isDefault: addresses.length === 0,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        await fetchAddresses()
        setSelectedAddressId(data.data.id)
        setNewAddressOpen(false)
        setNewAddress({
          name: "",
          phone: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          postalCode: "",
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSavingAddress(false)
    }
  }

  // Handle Submit Order
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setOrderError("Please select or add a delivery address.")
      return
    }
    if (!deliveryDate) {
      setOrderError("Please choose a delivery date.")
      return
    }

    setSubmittingOrder(true)
    setOrderError(null)

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: selectedAddressId,
          deliveryDate,
          deliveryTime,
          paymentMethod,
          notes,
          couponCode: couponCode || undefined,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        sessionStorage.removeItem("appliedCouponCode")
        await refreshCart()
        router.push(`/account/orders?success=true&order=${data.data.orderNumber}`)
      } else {
        setOrderError(data.message || "Failed to place order. Please try again.")
      }
    } catch (err) {
      setOrderError("An unexpected network error occurred.")
    } finally {
      setSubmittingOrder(false)
    }
  }

  if (authLoading) {
    return <div className="min-h-screen py-20 text-center text-slate-500">Loading checkout...</div>
  }

  if (!user) {
    router.push("/login?redirect=/checkout")
    return null
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50/50 py-20 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 border border-pink-100 shadow-sm">
          <Cake className="h-12 w-12 text-pink-600 mx-auto" />
          <h2 className="text-2xl font-serif font-bold text-slate-900">Your cart is empty</h2>
          <p className="text-xs text-slate-500">You must have cakes in your bag to proceed to checkout.</p>
          <Link href="/cakes">
            <Button className="bg-pink-600 hover:bg-pink-700 text-white rounded-full">
              Explore Our Cakes
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const deliveryFee = subtotal > 799 ? 0 : 50
  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee)

  return (
    <div className="min-h-screen bg-stone-50/50 py-4 md:py-6">
      <div className="w-[95%] max-w-[1440px] mx-auto px-3 sm:px-6">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-3">
          Complete Your Order
        </h1>

        {orderError && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {orderError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Main Checkout Form */}
          <div className="lg:col-span-8 space-y-4">
            {/* Step 1: Delivery Address */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-pink-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-pink-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-pink-600 text-white font-bold text-xs flex items-center justify-center">
                    1
                  </div>
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    Delivery Address
                  </h3>
                </div>

                <Dialog open={newAddressOpen} onOpenChange={setNewAddressOpen}>
                  <DialogTrigger
                    render={
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-pink-200 text-pink-700 hover:bg-pink-50 text-xs font-semibold"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add New Address
                      </Button>
                    }
                  />
                  <DialogContent className="bg-white rounded-3xl sm:max-w-md p-6 border border-pink-100">
                    <DialogHeader>
                      <DialogTitle className="font-serif font-bold text-xl text-slate-900">
                        Add New Delivery Address
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateAddress} className="space-y-3 pt-2">
                      <div>
                        <Label className="text-xs">Recipient Name</Label>
                        <Input
                          required
                          value={newAddress.name}
                          onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                          placeholder="Full Name"
                          className="h-9 text-xs rounded-xl mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Mobile Number</Label>
                        <Input
                          required
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="h-9 text-xs rounded-xl mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Address Line 1</Label>
                        <Input
                          required
                          value={newAddress.addressLine1}
                          onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                          placeholder="Flat / House / Building"
                          className="h-9 text-xs rounded-xl mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Street / Landmark</Label>
                        <Input
                          value={newAddress.addressLine2}
                          onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                          placeholder="Near Metro Station"
                          className="h-9 text-xs rounded-xl mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">City</Label>
                          <Input
                            required
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            placeholder="Bengaluru"
                            className="h-9 text-xs rounded-xl mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">PIN Code</Label>
                          <Input
                            required
                            value={newAddress.postalCode}
                            onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                            placeholder="560038"
                            className="h-9 text-xs rounded-xl mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">State</Label>
                        <Input
                          required
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          placeholder="Karnataka"
                          className="h-9 text-xs rounded-xl mt-1"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={savingAddress}
                        className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-full text-xs font-semibold h-10 mt-2"
                      >
                        {savingAddress ? "Saving..." : "Save Address"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {loadingAddresses ? (
                <p className="text-xs text-slate-400">Loading your addresses...</p>
              ) : addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? "border-pink-600 bg-pink-50/50 shadow-xs ring-1 ring-pink-500"
                          : "border-slate-200 hover:border-pink-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-slate-900">{addr.name}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold text-pink-600 uppercase bg-pink-100 px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">{addr.phone}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {addr.addressLine1}, {addr.addressLine2 && `${addr.addressLine2}, `}
                        {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-pink-50/50 text-center space-y-3">
                  <MapPin className="h-8 w-8 text-pink-600 mx-auto" />
                  <p className="text-xs text-slate-600">No addresses saved yet. Please add your delivery address.</p>
                  <Button
                    onClick={() => setNewAddressOpen(true)}
                    className="bg-pink-600 hover:bg-pink-700 text-white rounded-full text-xs"
                  >
                    Add Address Now
                  </Button>
                </div>
              )}
            </div>

            {/* Step 2: Schedule Delivery */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-pink-100 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-pink-100">
                <div className="h-7 w-7 rounded-full bg-pink-600 text-white font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <h3 className="font-serif font-bold text-lg text-slate-900">
                  Delivery Date & Time Slot
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Delivery Date
                  </Label>
                  <Input
                    type="date"
                    required
                    value={deliveryDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="h-10 text-xs rounded-xl border-pink-200 mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Preferred Time Slot
                  </Label>
                  <select
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="w-full h-10 px-3 text-xs rounded-xl border border-pink-200 bg-white text-slate-800 mt-1 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Cake Inscription / Delivery Instructions (Optional)
                </Label>
                <Textarea
                  placeholder="e.g. Message on cake: 'Happy Birthday Anya!' or 'Leave at front desk with security.'"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="text-xs rounded-xl border-pink-200 mt-1"
                />
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-pink-100 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-pink-100">
                <div className="h-7 w-7 rounded-full bg-pink-600 text-white font-bold text-xs flex items-center justify-center">
                  3
                </div>
                <h3 className="font-serif font-bold text-lg text-slate-900">
                  Payment Method
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setPaymentMethod("Cash on Delivery")}
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                    paymentMethod === "Cash on Delivery"
                      ? "border-pink-600 bg-pink-50/50 ring-1 ring-pink-500 shadow-xs"
                      : "border-slate-200 hover:border-pink-200 bg-white"
                  }`}
                >
                  <Truck className="h-5 w-5 text-pink-600" />
                  <div>
                    <p className="font-bold text-xs text-slate-900">Cash on Delivery (COD)</p>
                    <p className="text-[11px] text-slate-500">Pay cash or UPI upon delivery</p>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod("Online Payment")}
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                    paymentMethod === "Online Payment"
                      ? "border-pink-600 bg-pink-50/50 ring-1 ring-pink-500 shadow-xs"
                      : "border-slate-200 hover:border-pink-200 bg-white"
                  }`}
                >
                  <CreditCard className="h-5 w-5 text-pink-600" />
                  <div>
                    <p className="font-bold text-xs text-slate-900">Online Payment</p>
                    <p className="text-[11px] text-slate-500">Instant UPI, Debit / Credit Cards</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-pink-100 shadow-sm space-y-5">
              <h3 className="font-serif font-bold text-xl text-slate-900 pb-3 border-b border-pink-100">
                Order Summary
              </h3>

              {/* Items Mini List */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1 divide-y divide-pink-50">
                {items.map((i) => (
                  <div key={i.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-bold text-pink-600">{i.quantity}x</span>
                      <span className="truncate text-slate-700">{i.product?.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">₹{i.total}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 pt-3 border-t border-pink-100 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">₹{subtotal}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-rose-600">
                    <span>Coupon ({couponCode})</span>
                    <span className="font-bold">-₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-slate-900">
                    {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                  </span>
                </div>

                <div className="pt-3 border-t border-pink-100 flex items-center justify-between text-base">
                  <span className="font-serif font-bold text-slate-900">Final Total</span>
                  <span className="font-bold text-2xl text-pink-600">₹{totalAmount}</span>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handlePlaceOrder}
                disabled={submittingOrder}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-full h-12 font-bold shadow-md hover:shadow-lg transition-all"
              >
                {submittingOrder ? "Placing Order..." : "Confirm & Place Order"}
              </Button>
            </div>

            <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck className="h-4 w-4 text-pink-600" /> 100% Secure Checkout
              </div>
              <p>Your delivery is handled with sanitized temperature-controlled bakery transport.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
