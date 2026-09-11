"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Sparkles,
  Cake,
  Calendar,
  Phone,
  Mail,
  User,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Clock,
  Heart,
  HelpCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/providers/store-provider"

const CAKE_TYPES = [
  "Multi-Tiered Wedding Cake",
  "Themed Birthday Cake",
  "Anniversary Floral Heart Cake",
  "Character / 3D Sculpted Cake",
  "Corporate Event Celebration Cake",
  "Baby Shower & Gender Reveal Cake",
]

const FLAVORS = [
  "Belgian Dark Chocolate Truffle",
  "Red Velvet with Cream Cheese",
  "French Vanilla Bean with Berries",
  "Mango Passionfruit Compote",
  "Salted Caramel & Butterscotch Crunch",
  "Classic German Black Forest",
]

const SIZES = [
  "1.0 kg (Serves 6 - 8)",
  "1.5 kg (Serves 10 - 12)",
  "2.0 kg (Serves 15 - 18)",
  "3.0 kg (Serves 25 - 30)",
  "5.0+ kg Grand Multi-Tier (Serves 40+)",
]

export default function CustomCakePage() {
  const router = useRouter()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    cakeType: CAKE_TYPES[0],
    flavor: FLAVORS[0],
    size: SIZES[0],
    budget: "",
    requestedDate: "",
    message: "",
    referenceImage: "",
  })

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch("/api/custom-cake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          budget: formData.budget ? parseFloat(formData.budget) : undefined,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setSuccess(data.message)
        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phone || "",
          cakeType: CAKE_TYPES[0],
          flavor: FLAVORS[0],
          size: SIZES[0],
          budget: "",
          requestedDate: "",
          message: "",
          referenceImage: "",
        })
      } else {
        setError(data.message || "Failed to submit request. Please verify your details.")
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50/50 py-4 md:py-6">
      <div className="w-[95%] max-w-[1300px] mx-auto px-3 sm:px-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-1 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold">
            <Sparkles className="h-3 w-3" /> Bespoke Confectionery
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900">
            Custom Designer Cake Order
          </h1>
          <p className="max-w-xl text-xs sm:text-sm text-slate-600">
            Bring your dream cake to life! Describe your vision, select preferred flavors, and our master cake artist will connect with you with design mockups and pricing.
          </p>
          <div className="h-0.5 w-12 bg-pink-300 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-4 md:p-6 border border-pink-100 shadow-sm space-y-4">
            {success ? (
              <div className="py-12 text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-slate-900">
                  Custom Cake Inquiry Received!
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  {success}
                </p>
                <div className="pt-4 flex justify-center gap-4">
                  <Button
                    onClick={() => setSuccess(null)}
                    className="bg-pink-600 hover:bg-pink-700 text-white rounded-full text-xs"
                  >
                    Submit Another Inquiry
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/cakes")}
                    className="rounded-full text-xs border-pink-200"
                  >
                    Browse Regular Cakes
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                {/* Section 1: Contact Details */}
                <div className="space-y-4">
                  <h3 className="font-serif font-bold text-base text-slate-900 pb-2 border-b border-pink-100">
                    1. Contact Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs">Your Name</Label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="h-10 text-xs rounded-xl border-pink-200 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Email Address</Label>
                      <Input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="h-10 text-xs rounded-xl border-pink-200 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Phone Number</Label>
                      <Input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="h-10 text-xs rounded-xl border-pink-200 mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Cake Specifications */}
                <div className="space-y-4">
                  <h3 className="font-serif font-bold text-base text-slate-900 pb-2 border-b border-pink-100">
                    2. Cake Specifications
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Celebration / Cake Type</Label>
                      <select
                        value={formData.cakeType}
                        onChange={(e) => setFormData({ ...formData, cakeType: e.target.value })}
                        className="w-full h-10 px-3 text-xs rounded-xl border border-pink-200 bg-white text-slate-800 mt-1 focus:ring-2 focus:ring-pink-400"
                      >
                        {CAKE_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs">Preferred Flavor</Label>
                      <select
                        value={formData.flavor}
                        onChange={(e) => setFormData({ ...formData, flavor: e.target.value })}
                        className="w-full h-10 px-3 text-xs rounded-xl border border-pink-200 bg-white text-slate-800 mt-1 focus:ring-2 focus:ring-pink-400"
                      >
                        {FLAVORS.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs">Serving Size / Weight</Label>
                      <select
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        className="w-full h-10 px-3 text-xs rounded-xl border border-pink-200 bg-white text-slate-800 mt-1 focus:ring-2 focus:ring-pink-400"
                      >
                        {SIZES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs">Event / Delivery Date</Label>
                      <Input
                        type="date"
                        required
                        value={formData.requestedDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setFormData({ ...formData, requestedDate: e.target.value })}
                        className="h-10 text-xs rounded-xl border-pink-200 mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Estimated Budget (₹)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 2500"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="h-10 text-xs rounded-xl border-pink-200 mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Reference Image Link (Optional)</Label>
                    <Input
                      type="url"
                      placeholder="https://images.example.com/cake-inspiration.jpg"
                      value={formData.referenceImage}
                      onChange={(e) => setFormData({ ...formData, referenceImage: e.target.value })}
                      className="h-10 text-xs rounded-xl border-pink-200 mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">
                      Design Notes, Colors, Inscription or Theme Story
                    </Label>
                    <Textarea
                      required
                      rows={4}
                      placeholder="Tell us all details! E.g. 2 tiers, pastel pink with gold leaf, white chocolate flowers, and 'Happy 1st Birthday Liam' on a fondant plaque."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="text-xs rounded-xl border-pink-200 mt-1"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-full font-bold h-12 shadow-md"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {submitting ? "Submitting Inquiry..." : "Submit Custom Cake Inquiry"}
                </Button>
              </form>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-pink-100 shadow-sm space-y-5">
              <h3 className="font-serif font-bold text-lg text-slate-900 pb-3 border-b border-pink-100">
                How Custom Ordering Works
              </h3>

              <div className="space-y-4 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-pink-100 text-pink-600 font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Submit Your Inquiry</p>
                    <p className="mt-0.5">Fill out your theme, date, and flavor preferences.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-pink-100 text-pink-600 font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Chef Consultation & Quote</p>
                    <p className="mt-0.5">Our head cake designer will call or email you within 4 hours to finalize design sketches and pricing.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-pink-100 text-pink-600 font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Fresh Artisan Baking</p>
                    <p className="mt-0.5">Your masterpiece is handcrafted on the day of delivery with delicate chilled van transportation.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-pink-50/50 border border-pink-100 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Clock className="h-4 w-4 text-pink-600" /> Advance Notice Notice
              </div>
              <p>For multi-tiered wedding cakes, we recommend ordering at least 48–72 hours in advance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
