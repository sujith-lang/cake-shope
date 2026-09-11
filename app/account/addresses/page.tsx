"use client"

import React, { useEffect, useState } from "react"
import { MapPin, Plus, Trash2, CheckCircle2, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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

export default function AccountAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    isDefault: false,
  })
  const [saving, setSaving] = useState(false)

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/account/addresses")
      const data = await res.json()
      if (data.success) {
        setAddresses(data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAddresses()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        await fetchAddresses()
        setDialogOpen(false)
        setFormData({
          name: "",
          phone: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          postalCode: "",
          isDefault: false,
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this address?")) return
    try {
      await fetch(`/api/account/addresses?id=${id}`, { method: "DELETE" })
      await fetchAddresses()
    } catch (err) {
      console.error(err)
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await fetch("/api/account/addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isDefault: true }),
      })
      await fetchAddresses()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-pink-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-pink-100">
        <h2 className="font-serif font-bold text-xl text-slate-900">
          Saved Delivery Addresses ({addresses.length})
        </h2>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white rounded-full text-xs font-semibold">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add New Address
              </Button>
            }
          />
          <DialogContent className="bg-white rounded-3xl sm:max-w-md p-6 border border-pink-100">
            <DialogHeader>
              <DialogTitle className="font-serif font-bold text-xl text-slate-900">
                Add Delivery Address
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3 pt-2">
              <div>
                <Label className="text-xs">Full Name</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Recipient Name"
                  className="h-9 text-xs rounded-xl mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Phone Number</Label>
                <Input
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="h-9 text-xs rounded-xl mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Address Line 1</Label>
                <Input
                  required
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  placeholder="Flat, Apartment or House number"
                  className="h-9 text-xs rounded-xl mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Street / Locality</Label>
                <Input
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  placeholder="Landmark or locality"
                  className="h-9 text-xs rounded-xl mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">City</Label>
                  <Input
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Bengaluru"
                    className="h-9 text-xs rounded-xl mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">PIN Code</Label>
                  <Input
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="560038"
                    className="h-9 text-xs rounded-xl mt-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">State</Label>
                <Input
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Karnataka"
                  className="h-9 text-xs rounded-xl mt-1"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded text-pink-600 focus:ring-pink-500"
                />
                <label htmlFor="isDefault" className="text-xs text-slate-700 cursor-pointer">
                  Make this my default delivery address
                </label>
              </div>
              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-full text-xs font-semibold h-10 mt-2"
              >
                {saving ? "Saving..." : "Save Address"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading addresses...</div>
      ) : addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="p-5 rounded-2xl border border-pink-100 bg-stone-50/50 space-y-2 text-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-900">{addr.name}</span>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold text-pink-600 uppercase bg-pink-100 px-2 py-0.5 rounded-full">
                      Default Address
                    </span>
                  )}
                </div>
                <p className="text-slate-600 font-medium">{addr.phone}</p>
                <p className="text-slate-500 mt-1 leading-relaxed">
                  {addr.addressLine1}
                  {addr.addressLine2 && `, ${addr.addressLine2}`}
                  <br />
                  {addr.city}, {addr.state} - {addr.postalCode}
                </p>
              </div>

              <div className="pt-3 border-t border-pink-100 flex items-center justify-between">
                {!addr.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-pink-600 hover:underline font-semibold"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Primary
                  </span>
                )}
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                  aria-label="Delete address"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center space-y-3">
          <MapPin className="h-12 w-12 text-pink-600 mx-auto" />
          <h3 className="font-serif font-bold text-lg text-slate-900">No saved addresses</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Save your home or office address for instant 1-click checkout whenever you crave cakes!
          </p>
        </div>
      )}
    </div>
  )
}
