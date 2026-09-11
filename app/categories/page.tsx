import Link from "next/link"
import Image from "next/image"
import prisma from "@/lib/prisma"
import { ArrowRight, Cake } from "lucide-react"

export const metadata = {
  title: "Cake Categories | Sweet Delights Bakery",
  description: "Browse our collections of celebration cakes, Belgian chocolate truffles, cheesecakes, and cupcakes.",
}

export const dynamic = "force-dynamic"

export default async function CategoriesPage() {
  let categories: any[] = []
  try {
    categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
      orderBy: { name: "asc" },
    })
  } catch (error) {
    console.error("Failed to query categories:", error)
  }

  return (
    <div className="min-h-screen bg-stone-50/50 py-4 md:py-6">
      <div className="w-[95%] max-w-[1440px] mx-auto px-3 sm:px-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-1 mb-4">
          <span className="text-xs font-bold text-pink-600 uppercase tracking-widest">
            Curated Collections
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900">
            Browse by Category
          </h1>
          <p className="max-w-xl text-xs sm:text-sm text-slate-600">
            Find the perfect centerpiece for your wedding, birthday, anniversary, or casual sweet tooth indulgence.
          </p>
          <div className="h-0.5 w-12 bg-pink-300 rounded-full" />
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/cakes?category=${cat.slug}`}
              className="group relative flex flex-col bg-white rounded-3xl overflow-hidden border border-pink-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5"
            >
              {/* Image Preview */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-pink-50">
                <Image
                  src={cat.image || "/images/categories/chocolate.jpg"}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-white">
                  <span className="text-xs font-medium bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                    {cat._count.products} Handcrafted Cakes
                  </span>
                </div>
              </div>

              {/* Text Info */}
              <div className="p-6 space-y-2 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-serif font-bold text-slate-900 group-hover:text-pink-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {cat.description || "Freshly baked handcrafted creations."}
                  </p>
                </div>
                <div className="pt-4 flex items-center text-xs font-bold text-pink-600 group-hover:translate-x-1 transition-transform">
                  Explore Collection <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
