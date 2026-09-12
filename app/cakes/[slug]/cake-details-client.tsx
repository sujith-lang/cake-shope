"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Heart,
  ShoppingBag,
  Star,
  Clock,
  Truck,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Plus,
  Minus,
  MessageSquare,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ProductCard } from "@/components/product/product-card"
import { useAuth, useCart, useWishlist } from "@/components/providers/store-provider"

interface CakeDetailsClientProps {
  product: any
  relatedProducts: any[]
}

const WEIGHT_OPTIONS = [
  { label: "500 g", multiplier: 1 },
  { label: "1.0 kg", multiplier: 1.85 },
  { label: "1.5 kg", multiplier: 2.7 },
  { label: "2.0 kg", multiplier: 3.5 },
]

// Fallback SVG placeholder as a data URL
const FALLBACK_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%23fdf2f8'/%3E%3Ctext x='50%25' y='45%25' font-size='90' text-anchor='middle' dominant-baseline='middle'%3E%F0%9F%8E%82%3C/text%3E%3Ctext x='50%25' y='65%25' font-size='24' text-anchor='middle' dominant-baseline='middle' fill='%23ec4899' font-family='serif'%3ESweet Delights%3C/text%3E%3C/svg%3E`

export function CakeDetailsClient({
  product,
  relatedProducts,
}: CakeDetailsClientProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()

  const inWishlist = isInWishlist(product.id)

  const [selectedWeight, setSelectedWeight] = useState(WEIGHT_OPTIONS[0])
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [buying, setBuying] = useState(false)
  const [imgSrc, setImgSrc] = useState(product.image || FALLBACK_IMAGE)
  const [imgError, setImgError] = useState(false)

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null)
  const [reviewError, setReviewError] = useState<string | null>(null)

  const basePrice = product.price
  const baseDiscount = product.discountPrice
  const unitPrice = Math.round(basePrice * selectedWeight.multiplier)
  const unitDiscount = baseDiscount ? Math.round(baseDiscount * selectedWeight.multiplier) : null
  const isDiscounted = unitDiscount && unitDiscount < unitPrice
  const discountPercent = isDiscounted
    ? Math.round(((unitPrice - unitDiscount!) / unitPrice) * 100)
    : 0

  const handleAddToCart = async () => {
    setAdding(true)
    await addToCart(product.id, quantity)
    setAdding(false)
  }

  const handleBuyNow = async () => {
    setBuying(true)
    const ok = await addToCart(product.id, quantity)
    setBuying(false)
    if (ok) {
      router.push("/checkout")
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    setSubmittingReview(true)
    setReviewError(null)
    setReviewSuccess(null)

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setReviewSuccess("Thank you! Your review has been submitted for moderation.")
        setReviewComment("")
      } else {
        setReviewError(data.message || "Failed to submit review")
      }
    } catch {
      setReviewError("An error occurred while submitting your review.")
    } finally {
      setSubmittingReview(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50/50 py-3 sm:py-4 md:py-5">
      <div className="w-[95%] max-w-[1440px] mx-auto px-3 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-3 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-pink-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <Link href="/cakes" className="hover:text-pink-600 transition-colors">
            Cakes
          </Link>
          {product.category && (
            <>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <Link
                href={`/cakes?category=${product.category.slug}`}
                className="hover:text-pink-600 transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-slate-800 truncate">
            {product.name}
          </span>
        </nav>

        {/* Product Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white rounded-3xl p-6 md:p-10 border border-pink-100 shadow-sm mb-16">
          {/* Image Column */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-pink-50 border border-pink-100 shadow-md">
              <Image
                src={imgSrc}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                onError={() => {
                  if (!imgError) {
                    setImgError(true)
                    setImgSrc(FALLBACK_IMAGE)
                  }
                }}
              />
              {isDiscounted && (
                <Badge className="absolute top-4 left-4 bg-rose-500 text-white font-bold text-sm px-3 py-1 shadow-md">
                  {discountPercent}% OFF
                </Badge>
              )}
            </div>

            {/* Thumbnail preview if multi-images */}
            {product.images && product.images.length > 0 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                <button
                  onClick={() => setImgSrc(product.image)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 ${
                    imgSrc === product.image ? "border-pink-600" : "border-slate-200"
                  }`}
                >
                  <Image src={product.image} alt="main" fill className="object-cover" />
                </button>
                {product.images.map((img: any) => (
                  <button
                    key={img.id}
                    onClick={() => setImgSrc(img.imageUrl)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 ${
                      imgSrc === img.imageUrl ? "border-pink-600" : "border-slate-200"
                    }`}
                  >
                    <Image src={img.imageUrl} alt="preview" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Wishlist */}
              <div className="flex items-center justify-between">
                {product.category && (
                  <Link href={`/cakes?category=${product.category.slug}`}>
                    <Badge variant="secondary" className="bg-pink-100/80 text-pink-700 hover:bg-pink-100 text-xs font-semibold px-3 py-1">
                      {product.category.name}
                    </Badge>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleWishlist(product.id)}
                  className="text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-full text-xs"
                >
                  <Heart className={`h-4 w-4 mr-1.5 ${inWishlist ? "fill-rose-500 text-rose-500" : ""}`} />
                  {inWishlist ? "Saved in Wishlist" : "Add to Wishlist"}
                </Button>
              </div>

              {/* Title & Short Description */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-tight">
                {product.name}
              </h1>
              {product.shortDescription && (
                <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                  {product.shortDescription}
                </p>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.averageRating)
                          ? "fill-current"
                          : "text-slate-200 fill-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-800">
                  {product.averageRating}
                </span>
                <span className="text-xs text-slate-400">
                  ({product.reviews?.length || 15} verified customer reviews)
                </span>
              </div>

              {/* Price Display */}
              <div className="flex items-baseline gap-3 py-2 border-y border-pink-100">
                <span className="text-3xl md:text-4xl font-bold text-slate-900">
                  ₹{isDiscounted ? unitDiscount : unitPrice}
                </span>
                {isDiscounted && (
                  <span className="text-lg text-slate-400 line-through">
                    ₹{unitPrice}
                  </span>
                )}
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
                  Inclusive of all taxes
                </span>
              </div>

              {/* Weight Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Weight / Size:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {WEIGHT_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => setSelectedWeight(opt)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                        selectedWeight.label === opt.label
                          ? "border-pink-600 bg-pink-50/80 text-pink-700 shadow-xs ring-1 ring-pink-500"
                          : "border-slate-200 hover:border-pink-200 text-slate-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-4 pt-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Quantity:
                </label>
                <div className="flex items-center border border-pink-200 rounded-full bg-white p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-8 w-8 rounded-full hover:bg-pink-50 flex items-center justify-center text-slate-600 transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-8 w-8 rounded-full hover:bg-pink-50 flex items-center justify-center text-slate-600 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={adding || product.stock === 0}
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white rounded-full h-12 font-semibold shadow-md"
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {adding ? "Adding..." : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleBuyNow}
                  disabled={buying || product.stock === 0}
                  className="flex-1 border-2 border-pink-600 text-pink-600 hover:bg-pink-50 rounded-full h-12 font-semibold"
                >
                  {buying ? "Processing..." : "Buy Now"}
                </Button>
              </div>

              {/* Assurance badges */}
              <div className="grid grid-cols-3 gap-2 pt-4 text-center border-t border-pink-100 text-xs text-slate-600">
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-pink-50/50">
                  <Clock className="h-4 w-4 text-pink-600" />
                  <span className="font-semibold text-[11px]">Bake: {product.preparationTime || 4} Hours</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-pink-50/50">
                  <Truck className="h-4 w-4 text-pink-600" />
                  <span className="font-semibold text-[11px]">Chilled Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-pink-50/50">
                  <ShieldCheck className="h-4 w-4 text-pink-600" />
                  <span className="font-semibold text-[11px]">100% Hygienic</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs & Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          {/* Description & Details */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-pink-100 shadow-sm space-y-6">
            <h3 className="font-serif font-bold text-xl text-slate-900 pb-3 border-b border-pink-100">
              Cake Story & Craftsmanship
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              {product.description}
            </p>

            <div className="space-y-3 pt-4 border-t border-pink-100">
              <h4 className="font-semibold text-sm text-slate-800 uppercase tracking-wider">
                Storage & Serving Instructions
              </h4>
              <ul className="list-disc list-inside text-xs md:text-sm text-slate-600 space-y-1.5">
                <li>Store cake refrigerated at 2°C to 5°C.</li>
                <li>Best consumed within 24–48 hours of delivery.</li>
                <li>For optimal velvety texture, let cream cakes sit at room temperature for 15 minutes before slicing.</li>
                <li>Made in a 100% sterile and sanitized artisan kitchen.</li>
              </ul>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 md:p-8 border border-pink-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100">
              <h3 className="font-serif font-bold text-xl text-slate-900">
                Customer Reviews
              </h3>
              <span className="text-xs font-semibold text-pink-600">
                {product.reviews?.length || 0} Reviews
              </span>
            </div>

            {/* Submit Review Form */}
            <form onSubmit={handleReviewSubmit} className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Share Your Feedback
              </h4>

              {reviewSuccess && (
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {reviewSuccess}
                </div>
              )}
              {reviewError && (
                <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl text-xs">
                  {reviewError}
                </div>
              )}

              {/* Star Rating Picker */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600">Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          star <= reviewRating ? "fill-current" : "text-slate-200 fill-slate-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <Textarea
                placeholder="How was the taste, texture, and delivery experience?"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={2}
                required
                className="bg-white border-pink-200 text-xs rounded-xl"
              />

              <Button
                type="submit"
                size="sm"
                disabled={submittingReview}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-full text-xs h-8"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </Button>
            </form>

            {/* Reviews List */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev: any) => (
                  <div key={rev.id} className="p-3 rounded-xl bg-stone-50 border border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">
                        {rev.user?.name || "Verified Customer"}
                      </span>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600">{rev.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No customer reviews yet. Be the first to review this cake!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Cakes */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-2xl text-slate-900">
                You May Also Love
              </h3>
              <Link href={`/cakes?category=${product.category?.slug}`} className="text-xs font-semibold text-pink-600 hover:underline">
                View more {product.category?.name} →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard
                  key={rel.id}
                  id={rel.id}
                  name={rel.name}
                  slug={rel.slug}
                  price={rel.price}
                  discountPrice={rel.discountPrice}
                  image={rel.image}
                  category={rel.category}
                  averageRating={rel.averageRating}
                  reviewCount={rel.reviewCount}
                  stock={rel.stock}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
