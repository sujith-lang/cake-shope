"use client"

import React, { useEffect, useState } from "react"
import { User, Lock, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/providers/store-provider"

export default function AccountProfilePage() {
  const { user, refreshUser } = useAuth()

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setPhone(user.phone || "")
    }
  }, [user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMsg(null)

    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setProfileMsg({ type: "success", text: "Profile details updated successfully!" })
        await refreshUser()
      } else {
        setProfileMsg({ type: "error", text: data.message || "Failed to update profile." })
      }
    } catch {
      setProfileMsg({ type: "error", text: "An error occurred." })
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." })
      return
    }

    setSavingPassword(true)
    setPasswordMsg(null)

    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setPasswordMsg({ type: "success", text: "Password changed successfully!" })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        setPasswordMsg({ type: "error", text: data.message || "Failed to change password." })
      }
    } catch {
      setPasswordMsg({ type: "error", text: "An error occurred." })
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Edit Personal Information */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-pink-100 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-pink-100">
          <User className="h-5 w-5 text-pink-600" />
          <h2 className="font-serif font-bold text-xl text-slate-900">
            Personal Details
          </h2>
        </div>

        {profileMsg && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              profileMsg.type === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {profileMsg.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            {profileMsg.text}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
          <div>
            <Label className="text-xs">Account Email (Cannot be changed)</Label>
            <Input
              disabled
              value={user?.email || ""}
              className="h-10 text-xs rounded-xl bg-slate-50 mt-1 cursor-not-allowed text-slate-500"
            />
          </div>

          <div>
            <Label className="text-xs">Full Name</Label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 text-xs rounded-xl border-pink-200 mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Contact Phone Number</Label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="h-10 text-xs rounded-xl border-pink-200 mt-1"
            />
          </div>

          <Button
            type="submit"
            disabled={savingProfile}
            className="bg-pink-600 hover:bg-pink-700 text-white rounded-full text-xs font-semibold h-10 px-6"
          >
            {savingProfile ? "Saving..." : "Save Profile Changes"}
          </Button>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-pink-100 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-pink-100">
          <Lock className="h-5 w-5 text-pink-600" />
          <h2 className="font-serif font-bold text-xl text-slate-900">
            Security & Password
          </h2>
        </div>

        {passwordMsg && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              passwordMsg.type === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {passwordMsg.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            {passwordMsg.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          <div>
            <Label className="text-xs">Current Password</Label>
            <Input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 text-xs rounded-xl border-pink-200 mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">New Password (min 6 characters)</Label>
            <Input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 text-xs rounded-xl border-pink-200 mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Confirm New Password</Label>
            <Input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 text-xs rounded-xl border-pink-200 mt-1"
            />
          </div>

          <Button
            type="submit"
            disabled={savingPassword}
            className="bg-pink-600 hover:bg-pink-700 text-white rounded-full text-xs font-semibold h-10 px-6"
          >
            {savingPassword ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  )
}
