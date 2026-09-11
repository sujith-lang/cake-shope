"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  role: "CUSTOMER" | "ADMIN"
  phone?: string | null
}

interface Product {
  id: string
  name: string
  slug: string
  price: number
  discountPrice?: number | null
  image?: string | null
  stock?: number
  category?: { name: string }
}

interface CartItem {
  id: string
  productId: string
  quantity: number
  price: number
  total: number
  product: Product
}

interface CartContextType {
  items: CartItem[]
  totalCount: number
  subtotal: number
  loading: boolean
  addToCart: (productId: string, quantity?: number) => Promise<boolean>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

interface WishlistContextType {
  wishlistIds: Set<string>
  wishlistItems: Product[]
  count: number
  loading: boolean
  toggleWishlist: (productId: string) => Promise<boolean>
  isInWishlist: (productId: string) => boolean
  refreshWishlist: () => Promise<void>
}

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  setUserState: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)
const CartContext = createContext<CartContextType>({} as CartContextType)
const WishlistContext = createContext<WishlistContextType>({} as WishlistContextType)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartCount, setCartCount] = useState(0)
  const [cartSubtotal, setCartSubtotal] = useState(0)
  const [cartLoading, setCartLoading] = useState(false)

  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set())
  const [wishlistItems, setWishlistItems] = useState<Product[]>([])
  const [wishlistLoading, setWishlistLoading] = useState(false)

  // 1. Fetch User Auth
  const refreshUser = useCallback(async () => {
    try {
      setAuthLoading(true)
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setUser(data.data)
          return
        }
      }
      setUser(null)
    } catch {
      setUser(null)
    } finally {
      setAuthLoading(false)
    }
  }, [])

  // 2. Fetch Cart (only when relevant)
  const refreshCart = useCallback(async () => {
    try {
      setCartLoading(true)
      const res = await fetch("/api/cart")
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setCartItems(data.data.items || [])
          setCartCount(data.data.totalCount || 0)
          setCartSubtotal(data.data.subtotal || 0)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setCartLoading(false)
    }
  }, [])

  // 3. Fetch Wishlist (only when relevant)
  const refreshWishlist = useCallback(async () => {
    try {
      setWishlistLoading(true)
      const res = await fetch("/api/wishlist")
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          const items: Product[] = data.data.items || []
          setWishlistItems(items)
          setWishlistIds(new Set(items.map((i) => i.id)))
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setWishlistLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  useEffect(() => {
    // Avoid running cart/wishlist queries on login, register, or admin pages
    if (
      !user ||
      user.role === "ADMIN" ||
      pathname === "/login" ||
      pathname === "/register" ||
      pathname?.startsWith("/admin")
    ) {
      if (!user) {
        setCartItems([])
        setCartCount(0)
        setCartSubtotal(0)
        setWishlistIds(new Set())
        setWishlistItems([])
      }
      return
    }

    refreshCart()
    refreshWishlist()
  }, [user, pathname, refreshCart, refreshWishlist])

  // Auth logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      setUser(null)
      setCartItems([])
      setCartCount(0)
      setCartSubtotal(0)
      setWishlistIds(new Set())
      setWishlistItems([])
      router.push("/login")
      router.refresh()
    }
  }

  // Cart actions
  const addToCart = async (productId: string, quantity = 1): Promise<boolean> => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return false
    }
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      })
      if (res.ok) {
        await refreshCart()
        return true
      }
      return false
    } catch (err) {
      console.error(err)
      return false
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) return
    try {
      await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      })
      await refreshCart()
    } catch (err) {
      console.error(err)
    }
  }

  const removeFromCart = async (productId: string) => {
    if (!user) return
    try {
      await fetch(`/api/cart?productId=${productId}`, { method: "DELETE" })
      await refreshCart()
    } catch (err) {
      console.error(err)
    }
  }

  const clearCart = async () => {
    if (!user) return
    try {
      await fetch("/api/cart", { method: "DELETE" })
      await refreshCart()
    } catch (err) {
      console.error(err)
    }
  }

  // Wishlist actions
  const toggleWishlist = async (productId: string): Promise<boolean> => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return false
    }
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      })
      if (res.ok) {
        await refreshWishlist()
        return true
      }
      return false
    } catch (err) {
      console.error(err)
      return false
    }
  }

  const isInWishlist = (productId: string) => {
    return wishlistIds.has(productId)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: authLoading,
        logout: handleLogout,
        refreshUser,
        setUserState: setUser,
      }}
    >
      <CartContext.Provider
        value={{
          items: cartItems,
          totalCount: cartCount,
          subtotal: cartSubtotal,
          loading: cartLoading,
          addToCart,
          updateQuantity,
          removeFromCart,
          clearCart,
          refreshCart,
        }}
      >
        <WishlistContext.Provider
          value={{
            wishlistIds,
            wishlistItems,
            count: wishlistItems.length,
            loading: wishlistLoading,
            toggleWishlist,
            isInWishlist,
            refreshWishlist,
          }}
        >
          {children}
        </WishlistContext.Provider>
      </CartContext.Provider>
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export const useCart = () => useContext(CartContext)
export const useWishlist = () => useContext(WishlistContext)
