"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Cake,
  Star,
  Eye,
  SlidersHorizontal,
} from "lucide-react"
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

interface Product {
  id: string
  name: string
  slug: string
  shortDescription?: string | null
  description: string
  price: number
  discountPrice?: number | null
  stock: number
  categoryId: string
  category?: { id: string; name: string }
  image: string
  isFeatured: boolean
  isActive: boolean
  preparationTime?: number | null
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    price: "",
    discountPrice: "",
    stock: "15",
    categoryId: "",
    image: "/images/cakes/chocolate-truffle.jpg",
    isFeatured: false,
    isActive: true,
    preparationTime: "4",
  })
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setErrorMsg(null)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (res.ok && data.success) {
        setFormData((prev) => ({ ...prev, image: data.url }))
      } else {
        setErrorMsg(data.message || "Image upload failed")
      }
    } catch {
      setErrorMsg("Image upload failed")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/products?includeInactive=true")
      const json = await res.json()
      if (json.success) {
        setProducts(json.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories?all=true")
      const json = await res.json()
      if (json.success) {
        setCategories(json.data)
        if (json.data.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: json.data[0].id }))
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const handleOpenCreate = () => {
    setEditingProduct(null)
    setFormData({
      name: "",
      slug: "",
      shortDescription: "",
      description: "",
      price: "",
      discountPrice: "",
      stock: "15",
      categoryId: categories[0]?.id || "",
      image: "/images/cakes/chocolate-truffle.jpg",
      isFeatured: false,
      isActive: true,
      preparationTime: "4",
    })
    setErrorMsg(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p)
    setFormData({
      name: p.name,
      slug: p.slug,
      shortDescription: p.shortDescription || "",
      description: p.description,
      price: String(p.price),
      discountPrice: p.discountPrice ? String(p.discountPrice) : "",
      stock: String(p.stock),
      categoryId: p.categoryId,
      image: p.image || "/images/cakes/chocolate-truffle.jpg",
      isFeatured: p.isFeatured,
      isActive: p.isActive,
      preparationTime: p.preparationTime ? String(p.preparationTime) : "4",
    })
    setErrorMsg(null)
    setModalOpen(true)
  }

  const handleNameChange = (nameVal: string) => {
    const autoSlug = nameVal
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
    setFormData((prev) => ({
      ...prev,
      name: nameVal,
      slug: editingProduct ? prev.slug : autoSlug,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg(null)

    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        shortDescription: formData.shortDescription || null,
        description: formData.description,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        stock: parseInt(formData.stock) || 0,
        categoryId: formData.categoryId,
        image: formData.image,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
        preparationTime: parseInt(formData.preparationTime) || 4,
      }

      let res
      if (editingProduct) {
        res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()

      if (res.ok && data.success) {
        setSuccessMsg(data.message)
        setModalOpen(false)
        await fetchProducts()
        setTimeout(() => setSuccessMsg(null), 4000)
      } else {
        setErrorMsg(data.message || "Failed to save product.")
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
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (res.ok && data.success) {
        setSuccessMsg(data.message)
        await fetchProducts()
        setTimeout(() => setSuccessMsg(null), 4000)
      } else {
        alert(data.message || "Failed to delete product")
      }
    } catch (err) {
      console.error(err)
    }
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
    const matchesCat =
      categoryFilter === "all" || p.categoryId === categoryFilter
    return matchesSearch && matchesCat
  })

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Cake Catalog Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, update pricing, manage stock, and toggle active status for customer storefront.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold h-10 px-5 shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Add New Cake
        </Button>
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
            placeholder="Search cake name, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-slate-900 border-slate-800 text-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-400">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/50">
                <th className="p-4 font-semibold">Cake</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Price (₹)</th>
                <th className="p-4 font-semibold">Stock</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Featured</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-900/60">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                          <Image
                            src={product.image || "/images/cakes/chocolate-truffle.jpg"}
                            alt={product.name}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{product.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">/{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-300 font-medium">
                        {product.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-white">
                      ₹{product.price}
                      {product.discountPrice && (
                        <span className="ml-1 text-[11px] text-rose-400 font-normal">
                          (₹{product.discountPrice})
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-medium">
                      <span className={product.stock <= 5 ? "text-amber-400 font-bold" : "text-slate-300"}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge className={product.isActive ? "bg-emerald-950/60 text-emerald-300 border-emerald-800" : "bg-rose-950/60 text-rose-300 border-rose-800"}>
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {product.isFeatured && (
                        <Badge className="bg-purple-950/60 text-purple-300 border-purple-800">
                          Featured
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenEdit(product)}
                        className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(product.id, product.name)}
                        className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No products found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-slate-950 text-slate-100 border border-slate-800 max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-xl text-white">
              {editingProduct ? "Edit Cake Details" : "Create New Cake"}
            </DialogTitle>
          </DialogHeader>

          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-300">Cake Name</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Belgian Truffle Delight"
                  className="h-9 text-xs rounded-xl bg-slate-900 border-slate-800 text-white mt-1"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-300">URL Slug</Label>
                <Input
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="belgian-truffle-delight"
                  className="h-9 text-xs rounded-xl bg-slate-900 border-slate-800 text-white mt-1 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-slate-300">Price (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="899"
                  className="h-9 text-xs rounded-xl bg-slate-900 border-slate-800 text-white mt-1"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-300">Discount Price (₹ Optional)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.discountPrice}
                  onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                  placeholder="749"
                  className="h-9 text-xs rounded-xl bg-slate-900 border-slate-800 text-white mt-1"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-300">Stock Quantity</Label>
                <Input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="h-9 text-xs rounded-xl bg-slate-900 border-slate-800 text-white mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-300">Category</Label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white mt-1"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs text-slate-300">Preparation Time (Hours)</Label>
                <Input
                  type="number"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                  placeholder="4"
                  className="h-9 text-xs rounded-xl bg-slate-900 border-slate-800 text-white mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-slate-300">Cake Image</Label>
              <div className="mt-1 space-y-2">
                {/* Preview */}
                {formData.image && (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
                    <Image
                      src={formData.image}
                      alt="Preview"
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                )}
                {/* Upload button */}
                <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium px-4 py-2 rounded-xl transition-colors">
                  {uploading ? "Uploading..." : "📁 Upload Image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
                {/* Show current URL (read-only) */}
                {formData.image && (
                  <p className="text-[10px] text-slate-500 font-mono truncate max-w-sm">
                    {formData.image}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label className="text-xs text-slate-300">Short Summary</Label>
              <Input
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="Dutch cocoa sponge layered with dark chocolate ganache."
                className="h-9 text-xs rounded-xl bg-slate-900 border-slate-800 text-white mt-1"
              />
            </div>

            <div>
              <Label className="text-xs text-slate-300">Full Description</Label>
              <Textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed ingredients and baking notes..."
                className="text-xs rounded-xl bg-slate-900 border-slate-800 text-white mt-1"
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded text-purple-600 bg-slate-900 border-slate-700"
                />
                Feature on Homepage
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-purple-600 bg-slate-900 border-slate-700"
                />
                Active (Visible in Storefront)
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
                {submitting ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
