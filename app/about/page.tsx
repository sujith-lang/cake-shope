import Link from "next/link"
import Image from "next/image"
import { Cake, Heart, Award, Users, CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "About Us | Sweet Delights Bakery",
  description: "Learn about the heritage, master pastry chefs, and organic ingredients behind Sweet Delights Bakery.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-stone-50/50 py-4 md:py-6">
      <div className="w-[95%] max-w-[1300px] mx-auto px-3 sm:px-6 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-1">
          <span className="text-xs font-bold text-pink-600 uppercase tracking-widest">
            Our Story & Craft
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900">
            Handcrafted with Love Since 2012
          </h1>
          <p className="max-w-2xl text-xs sm:text-sm text-slate-600 leading-relaxed">
            Sweet Delights began as a humble kitchen dream in Indiranagar, Bengaluru. Today, we are proud to have baked joy for over 15,000 birthdays, fairytale weddings, and intimate family celebrations.
          </p>
          <div className="h-0.5 w-12 bg-pink-300 rounded-full" />
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-5 md:p-8 border border-pink-100 shadow-sm">
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
              The Purest Ingredients, Uncompromising Passion
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We believe that a truly extraordinary cake requires extraordinary integrity. That is why we refuse to use artificial cake mixes, margarine, synthetic emulsifiers, or synthetic preservatives.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every single batch is baked with pure dairy cream, genuine Belgian and French cocoa, organic Bourbon vanilla beans, and farm-picked seasonal berries.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Real Belgian Chocolate
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Pure Dairy Cream & Butter
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Zero Chemical Preservatives
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> 100% Sanitized Kitchen
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative aspect-square rounded-2xl overflow-hidden shadow-lg border border-pink-100">
            <Image
              src="/images/cakes/chocolate-truffle.jpg"
              alt="Bakery artistry"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white rounded-3xl p-8 border border-pink-100 shadow-sm space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-pink-100 text-pink-600 mx-auto flex items-center justify-center">
              <Cake className="h-7 w-7" />
            </div>
            <h3 className="font-serif font-bold text-lg text-slate-900">Artisan Baking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Small batches slow-baked to perfection for that irreplaceable melt-in-the-mouth texture.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-pink-100 shadow-sm space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-pink-100 text-pink-600 mx-auto flex items-center justify-center">
              <Heart className="h-7 w-7" />
            </div>
            <h3 className="font-serif font-bold text-lg text-slate-900">Customer Love</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every detail, from personalized greeting cards to chilled packaging, is tailored for your delight.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-pink-100 shadow-sm space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-pink-100 text-pink-600 mx-auto flex items-center justify-center">
              <Award className="h-7 w-7" />
            </div>
            <h3 className="font-serif font-bold text-lg text-slate-900">Award-Winning Chefs</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Led by pastry masters with culinary training across premier European institutes.
            </p>
          </div>
        </div>

        {/* Call to action */}
        <div className="p-8 md:p-12 rounded-3xl bg-pink-600 text-white text-center space-y-4 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-serif font-bold">Ready to Taste the Sweet Magic?</h2>
          <p className="text-pink-100 text-sm max-w-xl mx-auto">
            Order online today with same-day doorstep delivery or custom-design your celebratory showstopper.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link href="/cakes">
              <Button size="lg" className="bg-white text-pink-700 hover:bg-pink-50 rounded-full font-bold px-8">
                Explore Cakes <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
