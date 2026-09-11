"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  LogOut,
  Package,
  MapPin,
  ShieldAlert,
  Sparkles,
  Cake,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { useAuth, useCart, useWishlist } from "@/components/providers/store-provider"

export default function Navbar() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { totalCount } = useCart()
  const { count: wishlistCount } = useWishlist()

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/cakes?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery("")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-pink-100 bg-white/95 backdrop-blur-md transition-all shadow-xs">
      <div className="w-[95%] max-w-[1440px] mx-auto px-3 sm:px-6 h-14 md:h-15 flex items-center justify-between gap-4">
        {/* Mobile menu and Brand Logo */}
        <div className="flex items-center gap-3 md:gap-6">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden text-slate-700 hover:text-pink-600">
                  <Menu className="h-6 w-6" />
                </Button>
              }
            />
            <SheetContent side="left" className="w-80 p-0 bg-white">
              <SheetHeader className="p-6 border-b border-pink-100 bg-pink-50/50">
                <SheetTitle className="text-left font-serif text-2xl font-bold text-pink-600 flex items-center gap-2">
                  <Cake className="h-6 w-6" /> Sweet Delights
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-6 space-y-3">
                <SheetClose render={<Link href="/" className="text-base font-medium text-slate-700 hover:text-pink-600 py-1.5 transition-colors">Home</Link>} />
                <SheetClose render={<Link href="/cakes" className="text-base font-medium text-slate-700 hover:text-pink-600 py-1.5 transition-colors">All Cakes</Link>} />
                <SheetClose render={<Link href="/categories" className="text-base font-medium text-slate-700 hover:text-pink-600 py-1.5 transition-colors">Categories</Link>} />
                <SheetClose render={<Link href="/custom-cake" className="text-base font-medium text-slate-700 hover:text-pink-600 py-1.5 transition-colors flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-pink-500" /> Custom Cakes</Link>} />
                <SheetClose render={<Link href="/about" className="text-base font-medium text-slate-700 hover:text-pink-600 py-1.5 transition-colors">About Bakery</Link>} />
                <SheetClose render={<Link href="/contact" className="text-base font-medium text-slate-700 hover:text-pink-600 py-1.5 transition-colors">Contact Us</Link>} />

                <div className="pt-4 mt-4 border-t border-pink-100 flex flex-col space-y-2">
                  {user ? (
                    <>
                      <div className="text-xs text-slate-400 font-medium px-1">SIGNED IN AS</div>
                      <div className="text-sm font-semibold text-slate-800 px-1 truncate">{user.name} ({user.email})</div>
                      {user.role === "ADMIN" && (
                        <SheetClose render={<Link href="/admin" className="text-sm font-semibold text-purple-700 bg-purple-50 p-2 rounded-lg flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> Admin Dashboard</Link>} />
                      )}
                      <SheetClose render={<Link href="/account/orders" className="text-sm text-slate-700 hover:text-pink-600 py-1.5">My Orders</Link>} />
                      <SheetClose render={<Link href="/account/wishlist" className="text-sm text-slate-700 hover:text-pink-600 py-1.5">My Wishlist</Link>} />
                      <SheetClose render={<Link href="/account/profile" className="text-sm text-slate-700 hover:text-pink-600 py-1.5">Profile Settings</Link>} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={logout}
                        className="mt-2 text-rose-600 border-rose-200 hover:bg-rose-50 w-full justify-start"
                      >
                        <LogOut className="h-4 w-4 mr-2" /> Logout
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2 pt-2">
                      <SheetClose render={<Link href="/login" className="w-full"><Button variant="outline" className="w-full border-pink-200 text-pink-700 hover:bg-pink-50">Log In</Button></Link>} />
                      <SheetClose render={<Link href="/register" className="w-full"><Button className="w-full bg-pink-600 hover:bg-pink-700 text-white">Create Account</Button></Link>} />
                    </div>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 shadow-xs">
              <Cake className="h-5 w-5" />
            </div>
            <span className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
              Sweet<span className="text-pink-600">Delights</span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-slate-700 hover:text-pink-600 transition-colors">
            Home
          </Link>
          <Link href="/cakes" className="text-sm font-medium text-slate-700 hover:text-pink-600 transition-colors">
            All Cakes
          </Link>
          <Link href="/categories" className="text-sm font-medium text-slate-700 hover:text-pink-600 transition-colors">
            Categories
          </Link>
          <Link href="/custom-cake" className="text-sm font-medium text-slate-700 hover:text-pink-600 transition-colors flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-pink-500" />
            Custom Cakes
          </Link>
          <Link href="/about" className="text-sm font-medium text-slate-700 hover:text-pink-600 transition-colors">
            About
          </Link>
          <Link href="/contact" className="text-sm font-medium text-slate-700 hover:text-pink-600 transition-colors">
            Contact
          </Link>
        </nav>

        {/* Search Bar / Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Search Toggle */}
          {searchOpen ? (
            <form onSubmit={handleSearchSubmit} className="relative flex items-center w-48 sm:w-64">
              <Input
                type="text"
                placeholder="Search cakes, flavors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="h-9 pl-3 pr-8 rounded-full border-pink-200 text-xs focus-visible:ring-pink-400"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="text-slate-600 hover:text-pink-600 hover:bg-pink-50 rounded-full"
              aria-label="Search cakes"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}

          {/* Wishlist Link */}
          <Link href="/account/wishlist">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-slate-600 hover:text-pink-600 hover:bg-pink-50 rounded-full"
              aria-label="View wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Cart Link */}
          <Link href="/cart">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-slate-600 hover:text-pink-600 hover:bg-pink-50 rounded-full"
              aria-label="View shopping bag"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-pink-600 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                  {totalCount}
                </span>
              )}
            </Button>
          </Link>

          {/* User Profile / Auth Dropdown */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-pink-50 text-pink-700 hover:bg-pink-100 hover:text-pink-800"
                    aria-label="Account menu"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-56 p-2 bg-white shadow-xl rounded-xl border border-pink-100">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-pink-100" />

                {user.role === "ADMIN" && (
                  <>
                    <DropdownMenuItem
                      onClick={() => router.push("/admin")}
                      className="text-purple-700 font-semibold cursor-pointer hover:bg-purple-50 rounded-lg"
                    >
                      <ShieldAlert className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-pink-100" />
                  </>
                )}

                <DropdownMenuItem
                  onClick={() => router.push("/account")}
                  className="cursor-pointer rounded-lg hover:bg-pink-50"
                >
                  <User className="h-4 w-4 mr-2 text-slate-500" />
                  My Account
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/account/orders")}
                  className="cursor-pointer rounded-lg hover:bg-pink-50"
                >
                  <Package className="h-4 w-4 mr-2 text-slate-500" />
                  My Orders
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/account/addresses")}
                  className="cursor-pointer rounded-lg hover:bg-pink-50"
                >
                  <MapPin className="h-4 w-4 mr-2 text-slate-500" />
                  Addresses
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/account/wishlist")}
                  className="cursor-pointer rounded-lg hover:bg-pink-50"
                >
                  <Heart className="h-4 w-4 mr-2 text-slate-500" />
                  Wishlist ({wishlistCount})
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-pink-100" />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4 border-pink-200 text-pink-700 hover:bg-pink-50 hover:text-pink-800 text-xs font-semibold h-9"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/register" className="hidden sm:inline-block">
                <Button
                  size="sm"
                  className="rounded-full px-4 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold h-9 shadow-sm"
                >
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
