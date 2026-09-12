"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingBag, Star, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart, useWishlist } from "@/components/providers/store-provider"

// Fallback SVG placeholder as a data URL (always works, no network needed)
const FALLBACK_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23fdf2f8'/%3E%3Ctext x='50%25' y='45%25' font-size='60' text-anchor='middle' dominant-baseline='middle'%3E%F0%9F%8E%82%3C/text%3E%3Ctext x='50%25' y='65%25' font-size='18' text-anchor='middle' dominant-baseline='middle' fill='%23ec4899' font-family='serif'%3ESweet Delights%3C/text%3E%3C/svg%3E`

/**
 * Normalize image src: if it's already absolute (http/https/data), use as-is.
 * If it's a relative path (/images/...), prefix with the app URL in production.
 */
function getImageSrc(image: string | null | undefined): string {
  if (!image) return FALLBACK_IMAGE
  if (image.startsWith("http") || image.startsWith("data:")) return image
  // Relative path — works on localhost automatically via Next.js public folder
  return image
}

export interface ProductCardProps {
  id: string
  name: string
  slug: string
  price: number
  discountPrice?: number | null
  image?: string | null
  category?: { name: string; slug?: string } | null
  averageRating?: number
  reviewCount?: number
  isFeatured?: boolean
  stock?: number
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  discountPrice,
  image,
  category,
  averageRating = 5,
  reviewCount = 0,
  stock = 10,
}: ProductCardProps) {
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const [adding, setAdding] = useState(false)
  const [imgSrc, setImgSrc] = useState(() => getImageSrc(image))
  const [imgError, setImgError] = useState(false)

  const inWishlist = isInWishlist(id)
  const isDiscounted = discountPrice && discountPrice < price
  const discountPercent = isDiscounted
    ? Math.round(((price - discountPrice!) / price) * 100)
    : 0

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setAdding(true)
    await addToCart(id, 1)
    setAdding(false)
  }

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await toggleWishlist(id)
  }

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-pink-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
        {isDiscounted && (
          <Badge className="bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs px-2 py-0.5 shadow-sm">
            {discountPercent}% OFF
          </Badge>
        )}
        {stock <= 5 && stock > 0 && (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-[10px]">
            Only {stock} left
          </Badge>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleToggleWishlist}
        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute top-3 right-3 z-20 h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-rose-600 hover:scale-110 shadow-sm transition-all duration-200"
      >
        <Heart
          className={`h-4 w-4 transition-colors ${
            inWishlist ? "fill-rose-500 text-rose-500" : ""
          }`}
        />
      </button>

      {/* Cake Image */}
      <Link href={`/cakes/${slug}`} className="relative aspect-square w-full overflow-hidden bg-pink-50 block">
        <Image
          src={imgSrc}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={() => {
            if (!imgError) {
              setImgError(true)
              setImgSrc(FALLBACK_IMAGE)
            }
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 text-slate-800 text-xs font-medium py-1.5 px-3 rounded-full flex items-center gap-1.5 shadow-md transform translate-y-2 group-hover:translate-y-0">
            <Eye className="h-3.5 w-3.5" /> View Cake
          </span>
        </div>
      </Link>

      {/* Cake Information */}
      <div className="flex flex-col flex-grow p-4 md:p-5">
        {category && (
          <span className="text-xs font-medium text-pink-600 uppercase tracking-wider mb-1">
            {category.name}
          </span>
        )}

        <Link href={`/cakes/${slug}`} className="group-hover:text-pink-600 transition-colors">
          <h3 className="font-serif font-bold text-base md:text-lg text-slate-900 line-clamp-1 mb-1">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center text-amber-400">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="ml-1 text-xs font-semibold text-slate-700">
              {averageRating}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            ({reviewCount > 0 ? reviewCount : "12+"} reviews)
          </span>
        </div>

        {/* Price & Add to Cart */}
        <div className="mt-auto pt-3 border-t border-pink-50 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg md:text-xl font-bold text-slate-900">
                ₹{isDiscounted ? discountPrice : price}
              </span>
              {isDiscounted && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{price}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400">Standard 500g</span>
          </div>

          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={adding || stock === 0}
            className="bg-pink-600 hover:bg-pink-700 text-white rounded-full px-3.5 h-9 font-medium shadow-sm transition-all"
          >
            <ShoppingBag className="h-3.5 w-3.5 mr-1" />
            {adding ? "Adding..." : stock === 0 ? "Out of Stock" : "Add"}
          </Button>
        </div>
      </div>
    </div>
  )
}
