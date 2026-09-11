"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingBag, Trash2, Cake, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart, useWishlist } from "@/components/providers/store-provider"

export default function AccountWishlistPage() {
  const { wishlistItems, toggleWishlist, loading } = useWishlist()
  const { addToCart } = useCart()

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-pink-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-pink-100">
        <h2 className="font-serif font-bold text-xl text-slate-900">
          My Saved Cakes ({wishlistItems.length})
        </h2>
        <Link href="/cakes">
          <Button variant="outline" size="sm" className="rounded-full text-xs border-pink-200 text-pink-700">
            Browse More Cakes
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading wishlist...</div>
      ) : wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlistItems.map((product) => {
            const isDiscounted = product.discountPrice && product.discountPrice < product.price
            return (
              <div
                key={product.id}
                className="group relative flex flex-col bg-stone-50/50 rounded-2xl overflow-hidden border border-pink-100 p-4 space-y-3"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-pink-50">
                  <Image
                    src={product.image || "/images/cakes/chocolate-truffle.jpg"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-rose-500 hover:scale-110 shadow-sm transition-transform"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  {product.category && (
                    <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider">
                      {product.category.name}
                    </span>
                  )}
                  <Link href={`/cakes/${product.slug}`} className="hover:text-pink-600 transition-colors">
                    <h4 className="font-serif font-bold text-base text-slate-900 line-clamp-1">
                      {product.name}
                    </h4>
                  </Link>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-lg text-slate-900">
                    ₹{isDiscounted ? product.discountPrice : product.price}
                  </span>
                  {isDiscounted && (
                    <span className="text-xs text-slate-400 line-through">
                      ₹{product.price}
                    </span>
                  )}
                </div>

                <div className="pt-2 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => addToCart(product.id, 1)}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-full text-xs h-9 font-semibold"
                  >
                    <ShoppingBag className="h-3.5 w-3.5 mr-1" /> Move to Cart
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="py-12 text-center space-y-3">
          <Heart className="h-12 w-12 text-pink-600 mx-auto" />
          <h3 className="font-serif font-bold text-lg text-slate-900">Your wishlist is empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Heart your favorite celebration cakes while browsing to easily find them when you're ready to celebrate!
          </p>
          <Link href="/cakes">
            <Button className="bg-pink-600 hover:bg-pink-700 text-white rounded-full text-xs mt-2">
              Browse Cake Menu
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
