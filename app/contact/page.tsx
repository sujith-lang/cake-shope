"use client"

import React, { useState } from "react"
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Cake,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setSuccess(data.message)
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        })
      } else {
        setError(data.message || "Failed to send your message. Please try again.")
      }
    } catch {
      setError("An unexpected network error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50/50 py-4 md:py-6">
      <div className="w-[95%] max-w-[1300px] mx-auto px-3 sm:px-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-1 mb-4">
          <span className="text-xs font-bold text-pink-600 uppercase tracking-widest">
            Get in Touch
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900">
            Contact Sweet Delights
          </h1>
          <p className="max-w-xl text-xs sm:text-sm text-slate-600">
            Have a question about our flavors, dietary accommodations, delivery coverage, or an ongoing order? We'd love to hear from you.
          </p>
          <div className="h-0.5 w-12 bg-pink-300 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Contact Info Sidebar */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-pink-100 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-xl text-slate-900 pb-3 border-b border-pink-100">
              Bakery Information
            </h3>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-pink-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800 text-sm">Bakery Address</p>
                  <p className="mt-0.5 leading-relaxed">
                    12 Artisan Lane, 100ft Road, Indiranagar, Bengaluru, Karnataka - 560038
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-pink-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800 text-sm">Direct Phone & WhatsApp</p>
                  <p className="mt-0.5">+91 98765 43210</p>
                  <p className="text-[11px] text-slate-400">Available Mon–Sun 8 AM to 10 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-pink-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800 text-sm">Email Inquiries</p>
                  <p className="mt-0.5">hello@sweetdelightsbakery.com</p>
                  <p className="text-[11px] text-slate-400">Orders, corporate events, and feedback</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-pink-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800 text-sm">Baking & Delivery Hours</p>
                  <p className="mt-0.5">Mon - Sat: 8:00 AM - 10:00 PM</p>
                  <p>Sunday: 9:00 AM - 9:00 PM</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">Midnight Delivery Notice</p>
              <p>For midnight surprise deliveries, please place orders before 6:00 PM on the date of delivery.</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-pink-100 shadow-sm space-y-5">
            <h3 className="font-serif font-bold text-xl text-slate-900 pb-3 border-b border-pink-100">
              Send Us a Message
            </h3>

            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                {success}
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Your Name</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jane Doe"
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
                    placeholder="jane@example.com"
                    className="h-10 text-xs rounded-xl border-pink-200 mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Phone (Optional)</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="h-10 text-xs rounded-xl border-pink-200 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Subject</Label>
                  <Input
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Inquiry regarding wedding cake"
                    className="h-10 text-xs rounded-xl border-pink-200 mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Message</Label>
                <Textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can our bakery assist you today?"
                  className="text-xs rounded-xl border-pink-200 mt-1"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-full font-bold h-11 shadow-md"
              >
                <Send className="mr-2 h-4 w-4" />
                {loading ? "Sending Message..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
