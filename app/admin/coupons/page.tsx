"use client"

import React, { useEffect, useState } from "react"
import { Tag, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minimumOrderAmount: "500",
    maximumDiscount: "200",
    usageLimit: "100",
    expiresAt: "",
    isActive: true,
  })
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/coupons")
      const data = await res.json()
      if (data.success) {
        setCoupons(data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg(null)

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code.toUpperCase().trim(),
          description: formData.description,
          discountType: formData.discountType,
          discountValue: parseFloat(formData.discountValue),
          minimumOrderAmount: formData.minimumOrderAmount ? parseFloat(formData.minimumOrderAmount) : null,
          maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : null,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
          expiresAt: formData.expiresAt || null,
          isActive: formData.isActive,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setSuccessMsg(data.message)
        setModalOpen(false)
        await fetchCoupons()
        setFormData({
          code: "",
          description: "",
          discountType: "PERCENTAGE",
          discountValue: "",
          minimumOrderAmount: "500",
          maximumDiscount: "200",
          usageLimit: "100",
          expiresAt: "",
          isActive: true,
        })
        setTimeout(() => setSuccessMsg(null), 3500)
      } else {
        setErrorMsg(data.message || "Failed to create coupon")
      }
    } catch {
      setErrorMsg("An error occurred.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (res.ok && data.success) {
        setSuccessMsg(data.message)
        await fetchCoupons()
        setTimeout(() => setSuccessMsg(null), 3500)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Promotional Coupons & Discounts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create promotional voucher codes for seasonal campaigns and customer rewards.
          </p>
        </div>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger
            render={
              <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold h-10 px-5 shadow-sm">
                <Plus className="h-4 w-4 mr-1.5" /> Create Coupon
              </Button>
            }
          />
          <DialogContent className="bg-slate-950 text-slate-100 border border-slate-800 max-w-md p-6 rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-serif font-bold text-xl text-white">
                Create Discount Coupon
              </DialogTitle>
            </DialogHeader>

            {errorMsg && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 pt-2">
              <div>
                <Label className="text-xs text-slate-300">Promo Code (Uppercase)</Label>
                <Input
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FESTIVE20"
                  className="h-9 text-xs rounded-xl bg-slate-900 border-slate-800 text-white mt-1 font-mono uppercase"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-300">Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Get 20% off celebration cakes"
                  className="h-9 text-xs rounded-xl bg-slate-900 border-slate-800 text-white mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-300">Discount Type</Label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white mt-1"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat Fixed (₹)</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs text-slate-300">
                    Discount Value ({formData.discountType === "PERCENTAGE" ? "%" : "₹"})
                  </Label>
                  <Input
                    type="number"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder={formData.discountType === "PERCENTAGE" ? "15" : "100"}
                    className="h-9 text-xs rounded-xl bg-slate-900 border-slate-800 text-white mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-300">Min Order Amount (₹)</Label>
                  <Input
                    type="number"
                    value={formData.minimumOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minimumOrderAmount: e.target.value })}
                    className="h-9 text-xs rounded-xl bg-slate-900 border-slate-800 text-white mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs text-slate-300">Max Discount (₹)</Label>
                  <Input
                    type="number"
                    value={formData.maximumDiscount}
                    onChange={(e) => setFormData({ ...formData, maximumDiscount: e.target.value })}
                    className="h-9 text-xs rounded-xl bg-slate-900 border-slate-800 text-white mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-300">Usage Limit</Label>
                  <Input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="h-9 text-xs rounded-xl bg-slate-900 border-slate-800 text-white mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs text-slate-300">Expiration Date</Label>
                  <Input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="h-9 text-xs rounded-xl bg-slate-900 border-slate-800 text-white mt-1"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="border-slate-800 text-slate-300 hover:bg-slate-900 rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold px-6"
                >
                  {submitting ? "Creating..." : "Create Coupon"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}

      <div className="rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/50">
                <th className="p-4 font-semibold">Code</th>
                <th className="p-4 font-semibold">Description</th>
                <th className="p-4 font-semibold">Discount</th>
                <th className="p-4 font-semibold">Min Order / Max Off</th>
                <th className="p-4 font-semibold">Usage (Used / Limit)</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading coupons...
                  </td>
                </tr>
              ) : coupons.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/60">
                  <td className="p-4 font-mono font-bold text-white text-sm">
                    {c.code}
                  </td>
                  <td className="p-4 text-slate-300">{c.description || "N/A"}</td>
                  <td className="p-4 font-bold text-white">
                    {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                  </td>
                  <td className="p-4 text-slate-400">
                    Min: ₹{c.minimumOrderAmount || 0}
                    {c.maximumDiscount && ` / Max: ₹${c.maximumDiscount}`}
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-white">{c.usedCount}</span>
                    <span className="text-slate-500"> / {c.usageLimit || "∞"}</span>
                  </td>
                  <td className="p-4">
                    <Badge className={c.isActive ? "bg-emerald-950/60 text-emerald-300 border-emerald-800" : "bg-rose-950/60 text-rose-300 border-rose-800"}>
                      {c.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(c.id)}
                      className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
