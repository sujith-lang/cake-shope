import Link from "next/link"
import { Cake, Heart, MapPin, Phone, Mail, Clock } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-6 pb-5 md:pt-8 md:pb-6 border-t border-stone-800">
      <div className="w-[95%] max-w-[1440px] mx-auto px-3 sm:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-pink-600 flex items-center justify-center text-white">
              <Cake className="h-5 w-5" />
            </div>
            <span className="text-2xl font-serif font-bold text-white tracking-tight">
              Sweet<span className="text-pink-500">Delights</span>
            </span>
          </div>
          <p className="text-sm text-stone-400 leading-relaxed">
            Crafting blissful memories with artisan baked treats, tiered celebration masterpieces, and bespoke flavors delivered fresh to your doorstep.
          </p>
          <div className="flex items-center gap-2 text-xs text-pink-400 font-medium">
            <Heart className="h-4 w-4 fill-current text-rose-500" /> Made with 100% pure dairy & organic ingredients
          </div>
        </div>

        {/* Quick Shop Links */}
        <div>
          <h4 className="font-serif font-bold text-lg text-white mb-4">Our Bakery</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/cakes" className="hover:text-pink-400 transition-colors">
                All Cakes & Desserts
              </Link>
            </li>
            <li>
              <Link href="/categories" className="hover:text-pink-400 transition-colors">
                Shop by Categories
              </Link>
            </li>
            <li>
              <Link href="/cakes?category=chocolate-cakes" className="hover:text-pink-400 transition-colors">
                Belgian Chocolate Truffles
              </Link>
            </li>
            <li>
              <Link href="/cakes?category=cheesecakes" className="hover:text-pink-400 transition-colors">
                New York Baked Cheesecakes
              </Link>
            </li>
            <li>
              <Link href="/custom-cake" className="text-pink-400 hover:text-pink-300 font-medium transition-colors">
                Order Custom Designer Cake
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <h4 className="font-serif font-bold text-lg text-white mb-4">Customer Care</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/about" className="hover:text-pink-400 transition-colors">
                About Our Chef & Story
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-pink-400 transition-colors">
                Contact & Bakery Location
              </Link>
            </li>
            <li>
              <Link href="/account/orders" className="hover:text-pink-400 transition-colors">
                Track Your Order
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-pink-400 transition-colors">
                Shopping Cart
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-pink-400 transition-colors">
                Customer Account
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact & Hours */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-lg text-white mb-4">Bakery Hours & Info</h4>
          <div className="flex items-start gap-2.5 text-sm text-stone-400">
            <Clock className="h-4 w-4 text-pink-500 mt-1 shrink-0" />
            <div>
              <p className="font-medium text-stone-300">Mon - Sat: 8:00 AM - 10:00 PM</p>
              <p className="text-xs">Sunday: 9:00 AM - 9:00 PM</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-stone-400">
            <Phone className="h-4 w-4 text-pink-500 shrink-0" />
            <span>+91 98765 43210</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-stone-400">
            <Mail className="h-4 w-4 text-pink-500 shrink-0" />
            <span>hello@sweetdelightsbakery.com</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-stone-400">
            <MapPin className="h-4 w-4 text-pink-500 shrink-0" />
            <span>12 Artisan Lane, Indiranagar, Bengaluru</span>
          </div>
        </div>
      </div>

      <div className="w-[95%] max-w-[1440px] mx-auto px-3 sm:px-6 mt-5 pt-3.5 border-t border-stone-800 text-center text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          &copy; {new Date().getFullYear()} Sweet Delights Bakery. All rights reserved. Handcrafted with passion.
        </div>
        <div className="flex items-center gap-6">
          <Link href="/about" className="hover:text-stone-400">About</Link>
          <Link href="/contact" className="hover:text-stone-400">Support</Link>
          <Link href="/cakes" className="hover:text-stone-400">Menu</Link>
        </div>
      </div>
    </footer>
  )
}
