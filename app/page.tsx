import Link from "next/link"
import Image from "next/image"
import prisma from "@/lib/prisma"
import { ProductCard } from "@/components/product/product-card"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  Cake,
  Heart,
  Truck,
  ShieldCheck,
  Award,
  ArrowRight,
  Star,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  let categories: any[] = []
  let featuredProducts: any[] = []

  try {
    // Fetch categories
    categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { products: true } },
      },
      take: 6,
    })

    // Fetch featured products
    featuredProducts = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: {
        category: { select: { name: true, slug: true } },
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
      },
      take: 8,
    })
  } catch (error) {
    console.error("Failed to query database for homepage:", error)
  }

  const formattedProducts = featuredProducts.map((p) => {
    const avgRating =
      p.reviews && p.reviews.length > 0
        ? p.reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / p.reviews.length
        : 5
    return {
      ...p,
      averageRating: Number(avgRating.toFixed(1)),
      reviewCount: p.reviews?.length || 0,
    }
  })

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-pink-50/80 via-white to-stone-50 py-6 sm:py-8 md:py-10">
        <div className="w-[95%] max-w-[1440px] mx-auto px-3 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          <div className="lg:col-span-7 space-y-3.5 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold tracking-wide uppercase shadow-xs">
              <Sparkles className="h-3 w-3 text-pink-600" /> Handcrafted Bakery & Patisserie
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight leading-[1.15]">
              Sweet Moments, <br />
              <span className="text-pink-600 italic font-normal">Artfully</span> Baked.
            </h1>
            <p className="max-w-xl text-sm sm:text-base text-slate-600 leading-relaxed mx-auto lg:mx-0">
              Immerse yourself in decadent Belgian chocolate truffles, light-as-air shortcakes, and bespoke designer wedding centerpieces baked daily with organic ingredients.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center lg:justify-start pt-0.5">
              <Link href="/cakes">
                <Button size="default" className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-white rounded-full px-6 h-10 text-sm shadow-md hover:shadow-lg transition-all">
                  Browse Cake Menu <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
              <Link href="/custom-cake">
                <Button size="default" variant="outline" className="w-full sm:w-auto rounded-full px-6 h-10 text-sm border-pink-200 text-pink-700 hover:bg-pink-50 transition-all">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5 text-pink-500" /> Design Custom Cake
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="pt-4 grid grid-cols-3 gap-3 border-t border-pink-100 max-w-md mx-auto lg:mx-0">
              <div>
                <p className="text-xl sm:text-2xl font-serif font-bold text-slate-900">100%</p>
                <p className="text-[11px] text-slate-500 font-medium">Fresh Daily Baked</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-serif font-bold text-slate-900">15k+</p>
                <p className="text-[11px] text-slate-500 font-medium">Happy Celebrations</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-serif font-bold text-slate-900">4.9★</p>
                <p className="text-[11px] text-slate-500 font-medium">Customer Rating</p>
              </div>
            </div>
          </div>

          {/* Hero Image Showcase */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src="/images/hero/hero-cake.jpg"
                alt="Delicious handcrafted cake"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-pink-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-pink-600 uppercase tracking-wider">Chef's Special</p>
                  <p className="text-sm font-serif font-bold text-slate-900">Belgian Truffle Symphony</p>
                </div>
                <Link href="/cakes/chocolate-truffle-cake">
                  <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white rounded-full text-xs h-7.5 px-3">
                    Order Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="w-full py-5 sm:py-6 md:py-7 bg-white">
        <div className="w-[95%] max-w-[1440px] mx-auto px-3 sm:px-6">
          <div className="flex flex-col items-center justify-center text-center space-y-1 mb-4">
            <span className="text-xs font-bold text-pink-600 uppercase tracking-widest">Our Collections</span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">Shop by Category</h2>
            <div className="h-0.5 w-12 bg-pink-300 rounded-full" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/cakes?category=${cat.slug}`}
                className="group relative flex flex-col items-center bg-pink-50/50 hover:bg-pink-100/60 rounded-2xl p-3 transition-all duration-300 border border-pink-100 hover:shadow-md hover:-translate-y-0.5 text-center"
              >
                <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden mb-2 border-2 border-white shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <Image
                    src={cat.image || "/images/categories/chocolate.jpg"}
                    alt={cat.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
                <h3 className="font-serif font-bold text-xs sm:text-sm text-slate-900 group-hover:text-pink-600 transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  {cat._count.products} Varieties
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED CAKES SECTION */}
      <section className="w-full py-5 sm:py-6 md:py-7 bg-stone-50/50">
        <div className="w-[95%] max-w-[1440px] mx-auto px-3 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-2">
            <div>
              <span className="text-xs font-bold text-pink-600 uppercase tracking-widest">Bestsellers</span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mt-0.5">Featured Cakes</h2>
              <p className="text-xs text-slate-500">Hand-picked seasonal favorites loved by our customers.</p>
            </div>
            <Link href="/cakes">
              <Button variant="outline" size="sm" className="rounded-full border-pink-200 text-pink-700 hover:bg-pink-50 text-xs h-8">
                View All Cakes ({featuredProducts.length}+) <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {formattedProducts.map((product) => (
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
        </div>
      </section>

      {/* 4. SPECIAL PROMO BANNER */}
      <section className="w-full py-5 sm:py-6 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 text-white shadow-inner">
        <div className="w-[95%] max-w-[1440px] mx-auto px-3 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-1">
            <h3 className="text-xl md:text-2xl font-serif font-bold">First Time Celebrating with Us?</h3>
            <p className="text-pink-100 text-xs sm:text-sm max-w-xl">
              Use promo code <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded text-white">WELCOME10</span> at checkout to receive 10% off your first handcrafted cake order!
            </p>
          </div>
          <Link href="/cakes">
            <Button size="default" className="bg-white text-pink-700 hover:bg-pink-50 rounded-full font-semibold px-6 h-9.5 text-xs sm:text-sm shadow-lg">
              Claim Discount Now
            </Button>
          </Link>
        </div>
      </section>

      {/* 5. WHY CHOOSE US */}
      <section className="w-full py-5 sm:py-6 md:py-7 bg-white">
        <div className="w-[95%] max-w-[1440px] mx-auto px-3 sm:px-6">
          <div className="flex flex-col items-center justify-center text-center space-y-1 mb-4">
            <span className="text-xs font-bold text-pink-600 uppercase tracking-widest">The Sweet Delights Promise</span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">Why Customers Adore Us</h2>
            <div className="h-0.5 w-12 bg-pink-300 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 text-center">
            <div className="flex flex-col items-center p-3.5 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-1.5">
              <div className="h-10 w-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shadow-xs">
                <Cake className="h-5 w-5" />
              </div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900">100% Fresh Daily</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Baked from scratch every morning without preservatives, synthetic food colors, or artificial essences.
              </p>
            </div>

            <div className="flex flex-col items-center p-3.5 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-1.5">
              <div className="h-10 w-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shadow-xs">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900">Egg & Eggless Options</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Dedicated eggless baking lines for dietary needs without compromising velvety moist texture.
              </p>
            </div>

            <div className="flex flex-col items-center p-3.5 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-1.5">
              <div className="h-10 w-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shadow-xs">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900">Chilled Van Delivery</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Temperature-controlled delivery packaging ensures your delicate frostings arrive picture-perfect.
              </p>
            </div>

            <div className="flex flex-col items-center p-3.5 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-1.5">
              <div className="h-10 w-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shadow-xs">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900">Master Cake Artists</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Over 15 years of artisan pastry craftsmanship creating customized multi-tier celebratory cakes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CUSTOM CAKE CALLOUT */}
      <section className="w-full py-5 sm:py-6 md:py-7 bg-pink-50/60 border-t border-pink-100">
        <div className="w-[95%] max-w-[1440px] mx-auto px-3 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-2.5 text-center lg:text-left">
            <span className="text-xs font-bold text-pink-600 uppercase tracking-widest">Bespoke Creations</span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
              Dreaming of a One-of-a-Kind Cake?
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl">
              From fairytale weddings to superhero birthdays, share your vision, flavor cravings, and reference images. Our head chef will craft a bespoke quote and design for you.
            </p>
            <div className="pt-0.5">
              <Link href="/custom-cake">
                <Button size="default" className="bg-pink-600 hover:bg-pink-700 text-white rounded-full px-6 h-9.5 text-xs sm:text-sm shadow-md">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Submit Custom Cake Request
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 relative aspect-video max-w-md mx-auto w-full rounded-2xl overflow-hidden shadow-lg border-4 border-white">
            <Image
              src="/images/cakes/custom-cake.jpg"
              alt="Designer custom cake creation"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
