"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { createClient } from "@/lib/supabase/client"
import { NavbarMenu as Navbar } from "@/components/navbar-menu"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { FloatingSellButton } from "@/components/floating-sell-button"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  Shield,
  Star,
  Package,
  CheckCircle2,
  Calendar,
  Loader2,
} from "lucide-react"

interface SellerProfile {
  id: string
  display_name: string
  avatar_url: string | null
  rating: number
  items_sold: number
  verified: boolean
  created_at: string
}

interface Listing {
  id: string
  title: string
  price: number
  market_price: number
  images: string[]
  city: string
  created_at: string
}

// Fallback mock data
const mockSellers: Record<string, { seller: SellerProfile; products: Listing[] }> = {
  "mock-1": {
    seller: { id: "mock-1", display_name: "Ahmed B.", avatar_url: null, rating: 4.8, items_sold: 23, verified: true, created_at: "2024-03-01" },
    products: [
      { id: "1", title: "iPhone 13 Pro Max 256GB", price: 650, market_price: 900, images: ["https://images.unsplash.com/photo-1632661674596-df8be59a8a7a?w=400&h=400&fit=crop"], city: "Tunis", created_at: new Date().toISOString() },
      { id: "6", title: "AirPods Pro 2", price: 180, market_price: 280, images: ["https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=400&h=400&fit=crop"], city: "Tunis", created_at: new Date().toISOString() },
    ],
  },
}

function SellerContent({ id }: { id: string }) {
  const { t } = useLanguage()
  const supabase = createClient()
  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [products, setProducts] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSeller()
  }, [id])

  const fetchSeller = async () => {
    setLoading(true)

    // Try Supabase
    const { data: sellerData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single()

    if (sellerData) {
      setSeller(sellerData)

      const { data: listingsData } = await supabase
        .from("listings")
        .select("*")
        .eq("seller_id", id)
        .eq("status", "active")
        .order("created_at", { ascending: false })

      setProducts(listingsData || [])
    } else {
      // Fallback
      const fallback = mockSellers[id] || mockSellers["mock-1"]
      setSeller(fallback.seller)
      setProducts(fallback.products)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="h-8 w-8 animate-spin text-success" />
      </div>
    )
  }

  if (!seller) return null

  const memberSince = new Date(seller.created_at).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  })

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Back button */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        {t("nav.buy")}
      </Link>

      {/* Seller Profile Card */}
      <div className="mb-8 rounded-xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-secondary text-3xl font-bold text-foreground">
            {seller.avatar_url ? (
              <img src={seller.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              seller.display_name.charAt(0).toUpperCase()
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {seller.display_name}
              </h1>
              {seller.verified && (
                <Badge className="gap-1 bg-success/10 text-success hover:bg-success/20">
                  <Shield className="h-3.5 w-3.5" />
                  {t("profile.verified")}
                </Badge>
              )}
            </div>

            {/* Stats */}
            <div className="mb-4 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:justify-start sm:gap-6">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-foreground">{seller.rating}</span>
                <span>{t("profile.rating")}</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="font-medium text-foreground">{seller.items_sold}</span>
                <span>{t("profile.itemsSold")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                <span className="font-medium text-foreground">{products.length}</span>
                <span>{t("profile.activeListings")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{memberSince}</span>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
              <div className="flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Réponse rapide
              </div>
              <div className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground">
                <Star className="h-3.5 w-3.5" />
                Top vendeur
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Listings */}
      <div>
        <h2 className="mb-6 text-xl font-bold text-foreground sm:text-2xl">
          {t("profile.activeListings")} ({products.length})
        </h2>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price}
                marketPrice={product.market_price || product.price * 1.3}
                image={product.images?.[0] || ""}
                location={product.city}
                postedMinutesAgo={Math.max(1, Math.floor((Date.now() - new Date(product.created_at).getTime()) / 60000))}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">Aucune annonce active.</p>
        )}
      </div>
    </main>
  )
}

export default function SellerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SellerContent id={id} />
      <Footer />
      <FloatingSellButton />
    </div>
  )
}
