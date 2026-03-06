"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { createClient } from "@/lib/supabase/client"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { ArrowDown, Flame, Bell, TrendingUp, Clock, Loader2 } from "lucide-react"

// Fallback mock data
const mockDeals = [
  { id: "1", title: "iPhone 13 Pro Max 256GB", price: 650, market_price: 900, images: ["https://images.unsplash.com/photo-1632661674596-df8be59a8a7a?w=400&h=400&fit=crop"], city: "Tunis", created_at: new Date(Date.now() - 2 * 60000).toISOString() },
  { id: "2", title: "PlayStation 5 Digital Edition", price: 450, market_price: 650, images: ["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop"], city: "Sousse", created_at: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: "3", title: "MacBook Air M2 2023", price: 1200, market_price: 1650, images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop"], city: "Sfax", created_at: new Date(Date.now() - 8 * 60000).toISOString() },
  { id: "4", title: "Samsung Galaxy S24 Ultra", price: 580, market_price: 800, images: ["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop"], city: "Tunis", created_at: new Date(Date.now() - 12 * 60000).toISOString() },
  { id: "5", title: "Nintendo Switch OLED", price: 320, market_price: 450, images: ["https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=400&fit=crop"], city: "Monastir", created_at: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: "6", title: "AirPods Pro 2", price: 180, market_price: 280, images: ["https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=400&h=400&fit=crop"], city: "Nabeul", created_at: new Date(Date.now() - 18 * 60000).toISOString() },
  { id: "7", title: 'iPad Pro 12.9" M2', price: 950, market_price: 1300, images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop"], city: "Bizerte", created_at: new Date(Date.now() - 22 * 60000).toISOString() },
  { id: "8", title: "Sony WH-1000XM5", price: 220, market_price: 350, images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop"], city: "Gabès", created_at: new Date(Date.now() - 28 * 60000).toISOString() },
]

const filterTabs = [
  { key: "cheapest", icon: ArrowDown },
  { key: "recent", icon: Clock },
  { key: "category", icon: TrendingUp },
  { key: "distance", icon: Flame },
]

export function LiveDeals() {
  const { t } = useLanguage()
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("cheapest")
  const supabase = createClient()

  useEffect(() => {
    fetchListings()
  }, [activeFilter])

  const fetchListings = async () => {
    setLoading(true)

    try {
      let query = supabase
        .from("listings")
        .select("*")
        .eq("status", "active")
        .limit(100)

      const queryPromise = query
      const timeoutPromise = new Promise<{ data: any, error: any }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: new Error("Fetch timeout") }), 5000)
      )

      const { data, error } = await Promise.race([queryPromise, timeoutPromise])

      if (error) {
        console.error("Error fetching live deals:", error)
        throw error
      }

      if (data && data.length > 0) {
        const now = new Date().getTime()

        data.sort((a: any, b: any) => {
          const aActiveBoost = a.boost_expires_at && new Date(a.boost_expires_at).getTime() > now ? a.boost_amount : 0
          const bActiveBoost = b.boost_expires_at && new Date(b.boost_expires_at).getTime() > now ? b.boost_amount : 0

          if (aActiveBoost !== bActiveBoost) {
            return bActiveBoost - aActiveBoost
          }

          if (activeFilter === "cheapest") return a.price - b.price
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })

        setListings(data.slice(0, 8))
      } else {
        setListings(mockDeals)
      }
    } catch (err) {
      console.error("Failed to load live deals:", err)
      setListings(mockDeals)
    } finally {
      setLoading(false)
    }
  }

  const toProductCard = (listing: any) => ({
    id: listing.id,
    title: listing.title,
    price: listing.price,
    marketPrice: listing.market_price || listing.price * 1.3,
    image: listing.images?.[0] || "https://images.unsplash.com/photo-1632661674596-df8be59a8a7a?w=400&h=400&fit=crop",
    location: listing.city,
    postedMinutesAgo: Math.max(1, Math.floor((Date.now() - new Date(listing.created_at).getTime()) / 60000)),
  })

  return (
    <section id="deals" className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-white sm:text-3xl">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400"></span>
              </span>
              {t("deals.live")}
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {filterTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeFilter === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${isActive
                    ? "bg-white text-black"
                    : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white border border-white/10"
                    }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t(`filter.${tab.key}`)}
                </button>
              )
            })}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {listings.map((listing) => (
              <ProductCard key={listing.id} {...toProductCard(listing)} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
