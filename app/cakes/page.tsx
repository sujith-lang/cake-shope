"use client"

import React, { useEffect, useState, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ProductCard } from "@/components/product/product-card"
import { ProductSkeleton } from "@/components/product/product-skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, SlidersHorizontal, RotateCcw, Cake } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  slug: string
  price: number
  discountPrice?: number | null
  image?: string | null
  category?: { name: string; slug: string }
  averageRating?: number
  reviewCount?: number
  stock?: number
  isFeatured?: boolean
}

export default function CakesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialSearch = searchParams.get("search") || ""
  const initialCategory = searchParams.get("category") || "all"
  const initialSort = searchParams.get("sort") || "featured"

  const [search, setSearch] = useState(initialSearch)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [sort, setSort] = useState(initialSort)

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Sync state when URL params change
  useEffect(() => {
    setSearch(searchParams.get("search") || "")
    setSelectedCategory(searchParams.get("category") || "all")
    setSort(searchParams.get("sort") || "featured")
  }, [searchParams])

  // Fetch Categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories")
        const json = await res.json()
        if (json.success) {
          setCategories(json.data)
        }
      } catch (err) {
        console.error("Categories fetch error:", err)
      }
    }
    fetchCategories()
  }, [])

  // Fetch Products
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (selectedCategory && selectedCategory !== "all") {
          params.set("category", selectedCategory)
        }
        if (search) {
          params.set("search", search)
        }
        if (sort) {
          params.set("sort", sort)
        }

        const res = await fetch(`/api/products?${params.toString()}`)
        const json = await res.json()
        if (json.success) {
          setProducts(json.data)
        }
      } catch (err) {
        console.error("Products fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      fetchProducts()
    }, 200)

    return () => clearTimeout(timer)
  }, [selectedCategory, search, sort])

  const handleCategoryChange = (catSlug: string) => {
    setSelectedCategory(catSlug)
    const params = new URLSearchParams(searchParams.toString())
    if (catSlug === "all") {
      params.delete("category")
    } else {
      params.set("category", catSlug)
    }
    router.replace(`/cakes?${params.toString()}`, { scroll: false })
  }

  const handleClearFilters = () => {
    setSearch("")
    setSelectedCategory("all")
    setSort("featured")
    router.replace("/cakes", { scroll: false })
  }

  return (
    <div className="min-h-screen bg-stone-50/50 py-4 md:py-6">
      <div className="w-[95%] max-w-[1440px] mx-auto px-3 sm:px-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-1 mb-4">
          <span className="text-xs font-bold text-pink-600 uppercase tracking-widest">
            Freshly Baked Menu
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900">
            Handcrafted Cakes & Delights
          </h1>
          <p className="max-w-xl text-xs sm:text-sm text-slate-600">
            Explore our decadent collection of artisan celebration cakes, baked fresh daily with pure dairy cream and natural fruits.
          </p>
          <div className="h-0.5 w-12 bg-pink-300 rounded-full" />
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-pink-100 mb-4 space-y-2.5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by name, chocolate, fruit..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 rounded-full border-pink-200 text-sm focus-visible:ring-pink-400"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Sort:
              </div>
              <Select value={sort} onValueChange={(val) => { if (val) setSort(val); }}>
                <SelectTrigger className="w-48 h-10 rounded-full border-pink-200 text-xs font-medium">
                  <SelectValue placeholder="Sort cakes" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl shadow-lg border-pink-100">
                  <SelectItem value="featured">Featured Cakes</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest Arrivals</SelectItem>
                  <SelectItem value="name-asc">Alphabetical (A - Z)</SelectItem>
                </SelectContent>
              </Select>

              {(search || selectedCategory !== "all" || sort !== "featured") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-full h-10 px-3"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
                </Button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2 border-t border-pink-50">
            <button
              onClick={() => handleCategoryChange("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-pink-600 text-white shadow-xs"
                  : "bg-pink-50 text-slate-700 hover:bg-pink-100"
              }`}
            >
              All Cakes
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.slug
                    ? "bg-pink-600 text-white shadow-xs"
                    : "bg-pink-50 text-slate-700 hover:bg-pink-100"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Showing {products.length} {products.length === 1 ? "Cake" : "Cakes"}
          </p>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                discountPrice={product.discountPrice}
                image={product.image}
                category={product.category}
                averageRating={product.averageRating}
                reviewCount={product.reviewCount}
                stock={product.stock}
                isFeatured={product.isFeatured}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-pink-100 text-center max-w-md mx-auto my-12 shadow-sm space-y-4">
            <div className="h-16 w-16 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
              <Cake className="h-8 w-8" />
            </div>
            <h3 className="font-serif font-bold text-xl text-slate-900">
              No matching cakes found
            </h3>
            <p className="text-xs text-slate-500">
              We couldn't find any cakes matching your current filters. Try changing your search keywords or category selection.
            </p>
            <Button
              onClick={handleClearFilters}
              className="bg-pink-600 hover:bg-pink-700 text-white rounded-full text-xs px-6 h-9"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
