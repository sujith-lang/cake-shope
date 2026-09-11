"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, FolderTree } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  isActive: boolean
  _count?: { products: number }
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "/images/categories/chocolate.jpg",
    isActive: true,
  })
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/categories?all=true")
      const data = await res.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleOpenCreate = () => {
    setEditingCategory(null)
    setFormData({
      name: "",
      slug: "",
      description: "",
      image: "/images/categories/chocolate.jpg",
      isActive: true,
    })
    setErrorMsg(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c)
    setFormData({
      name: c.name,
      slug: c.slug,
      description: c.description || "",
      image: c.image || "/images/categories/chocolate.jpg",
      isActive: c.isActive,
    })
    setErrorMsg(null)
    setModalOpen(true)
  }

  const handleNameChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: editingCategory ? prev.slug : slug,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg(null)

    try {
      let res
      if (editingCategory) {
        res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
      } else {
        res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
      }

      const data = await res.json()

      if (res.ok && data.success) {
        setSuccessMsg(data.message)
        setModalOpen(false)
        await fetchCategories()
        setTimeout(() => setSuccessMsg(null), 4000)
      } else {
        setErrorMsg(data.message || "Failed to save category.")
      }
    } catch {
      setErrorMsg("An error occurred.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete or deactivate "${name}"?`)) return
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (res.ok && data.success) {
        setSuccessMsg(data.message)
        await fetchCategories()
        setTimeout(() => setSuccessMsg(null), 4000)
      } else {
        alert(data.message || "Failed to delete category")
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Category Collections
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize bakery catalogs into intuitive sections with custom promotional imagery.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold h-10 px-5 shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Add Category
        </Button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Categories Table */}
      <div className="rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/50">
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Slug</th>
                <th className="p-4 font-semibold">Products Assigned</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Loading categories...
                  </td>
                </tr>
              ) : categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-900/60">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                        <Image
                          src={cat.image || "/images/categories/chocolate.jpg"}
                          alt={cat.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{cat.name}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{cat.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-slate-400">/{cat.slug}</td>
                  <td className="p-4 font-bold text-white">
                    {cat._count?.products || 0} cakes
                  </td>
                  <td className="p-4">
                    <Badge className={cat.isActive ? "bg-emerald-950/60 text-emerald-300 border-emerald-800" : "bg-rose-950/60 text-rose-300 border-rose-800"}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleOpenEdit(cat)}
                      className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(cat.id, cat.name)}
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

      {/* Category Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-slate-950 text-slate-100 border border-slate-800 max-w-lg p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-xl text-white">
              {editingCategory ? "Edit Category" : "New Category"}
            </DialogTitle>
          </DialogHeader>

          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs text-slate-300">Category Name</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Fruit & Berry Cakes"
                className="h-9 text-xs rounded-xl bg-slate-900 border-slate-800 text-white mt-1"
              />
            </div>

            <div>
              <Label className="text-xs text-slate-300">Slug</Label>
              <Input
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="fruit-cakes"
                className="h-9 text-xs rounded-xl bg-slate-900 border-slate-800 text-white mt-1 font-mono"
              />
            </div>

            <div>
              <Label className="text-xs text-slate-300">Image Path / URL</Label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="/images/categories/fruit.jpg"
                className="h-9 text-xs rounded-xl bg-slate-900 border-slate-800 text-white mt-1"
              />
            </div>

            <div>
              <Label className="text-xs text-slate-300">Description</Label>
              <Textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Category summary for customers..."
                className="text-xs rounded-xl bg-slate-900 border-slate-800 text-white mt-1"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="catActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded text-purple-600 bg-slate-900 border-slate-700"
              />
              <label htmlFor="catActive" className="text-xs text-slate-300 cursor-pointer">
                Active in storefront navigation
              </label>
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
                {submitting ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
