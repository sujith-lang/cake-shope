"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { Star, Check, X, Trash2, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/reviews?all=true")
      const data = await res.json()
      if (data.success) {
        setReviews(data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleUpdateStatus = async (id: string, isApproved: boolean) => {
    try {
      const res = await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isApproved }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSuccessMsg(`Review ${isApproved ? "Approved" : "Rejected"}`)
        await fetchReviews()
        setTimeout(() => setSuccessMsg(null), 3500)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review permanently?")) return
    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      if (res.ok && data.success) {
        setSuccessMsg(data.message)
        await fetchReviews()
        setTimeout(() => setSuccessMsg(null), 3500)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
          Customer Reviews Moderation
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review customer feedback, approve ratings for public display on cake pages, or reject inappropriate submissions.
        </p>
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
                <th className="p-4 font-semibold">Cake Product</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Rating</th>
                <th className="p-4 font-semibold">Comment</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading reviews...
                  </td>
                </tr>
              ) : reviews.length > 0 ? (
                reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-900/60">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                          <Image
                            src={rev.product?.image || "/images/cakes/chocolate-truffle.jpg"}
                            alt={rev.product?.name || "Cake"}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                        <span className="font-semibold text-white">{rev.product?.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">
                      <p className="font-semibold text-white">{rev.user?.name}</p>
                      <p className="text-[11px] text-slate-500">{rev.user?.email}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </div>
                    </td>
                    <td className="p-4 max-w-xs leading-relaxed text-slate-200">
                      {rev.comment}
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <Badge className={rev.isApproved ? "bg-emerald-950/60 text-emerald-300 border-emerald-800" : "bg-amber-950/60 text-amber-300 border-amber-800"}>
                        {rev.isApproved ? "Public" : "Pending Approval"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {!rev.isApproved ? (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(rev.id, true)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs h-7 px-2.5 font-semibold"
                        >
                          <Check className="h-3.5 w-3.5 mr-1" /> Approve
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(rev.id, false)}
                          className="border-amber-800 text-amber-300 hover:bg-amber-950/50 rounded-lg text-xs h-7 px-2.5"
                        >
                          <X className="h-3.5 w-3.5 mr-1" /> Unpublish
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(rev.id)}
                        className="h-7 w-7 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No customer reviews to moderate.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
