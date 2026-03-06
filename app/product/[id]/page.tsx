"use client"

import { use, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { NavbarMenu as Navbar } from "@/components/navbar-menu"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FloatingSellButton } from "@/components/floating-sell-button"
import {
  MapPin,
  Clock,
  MessageCircle,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Shield,
  Star,
  Share2,
  Heart,
  Loader2,
  Flag,
} from "lucide-react"
import { toast } from "sonner"

interface Product {
  id: string
  title: string
  description: string
  price: number
  market_price: number
  images: string[]
  city: string
  category: string
  views: number
  status: string
  seller_id: string
  created_at: string
}

interface SellerProfile {
  id: string
  display_name: string
  avatar_url: string | null
  rating: number
  items_sold: number
  verified: boolean
}

// Fallback mock data for when Supabase is not configured
const fallbackProducts: Record<string, { product: Product; seller: SellerProfile }> = {
  "1": {
    product: {
      id: "1", title: "iPhone 13 Pro Max 256GB", description: "iPhone 13 Pro Max en excellent état. Batterie à 92%. Vendu avec boîte d'origine et chargeur. Aucune rayure.",
      price: 650, market_price: 900, images: ["https://images.unsplash.com/photo-1632661674596-df8be59a8a7a?w=800&h=800&fit=crop", "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&h=800&fit=crop"],
      city: "Tunis", category: "phones", views: 45, status: "active", seller_id: "mock-1", created_at: new Date().toISOString(),
    },
    seller: { id: "mock-1", display_name: "Ahmed B.", avatar_url: null, rating: 4.8, items_sold: 23, verified: true },
  },
  "2": {
    product: {
      id: "2", title: "PlayStation 5 Digital Edition", description: "PS5 Digital Edition comme neuve. Utilisée seulement quelques mois. Vendue avec une manette.",
      price: 450, market_price: 650, images: ["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=800&fit=crop"],
      city: "Sousse", category: "gaming", views: 32, status: "active", seller_id: "mock-2", created_at: new Date().toISOString(),
    },
    seller: { id: "mock-2", display_name: "Mehdi S.", avatar_url: null, rating: 4.5, items_sold: 12, verified: true },
  },
}

function ProductContent({ id }: { id: string }) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [currentImage, setCurrentImage] = useState(0)
  const [product, setProduct] = useState<Product | null>(null)
  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isReporting, setIsReporting] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [id])

  useEffect(() => {
    if (user && product) {
      checkFavorite()
    }
  }, [user, product])

  const fetchProduct = async () => {
    setLoading(true)

    // Try Supabase first
    const { data: dbProduct } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .single()

    if (dbProduct) {
      setProduct(dbProduct)

      // Increment views
      await supabase
        .from("listings")
        .update({ views: (dbProduct.views || 0) + 1 })
        .eq("id", id)

      // Fetch seller
      const { data: sellerData } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, rating, items_sold, verified")
        .eq("id", dbProduct.seller_id)
        .single()

      setSeller(sellerData)
    } else {
      // Use fallback mock data
      const fallback = fallbackProducts[id]
      if (fallback) {
        setProduct(fallback.product)
        setSeller(fallback.seller)
      }
    }

    setLoading(false)
  }

  const checkFavorite = async () => {
    if (!user || !product) return
    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("listing_id", product.id)
      .maybeSingle()

    setIsFavorited(!!data)
  }

  const toggleFavorite = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }
    if (!product) return

    if (isFavorited) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", product.id)
      setIsFavorited(false)
      toast.success(t("product.removeFavorite"))
    } else {
      await supabase
        .from("favorites")
        .insert({ user_id: user.id, listing_id: product.id })
      setIsFavorited(true)
      toast.success(t("product.addFavorite"))
    }
  }

  const contactSeller = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }
    if (!product || !seller) return

    // Don't contact yourself
    if (user.id === product.seller_id) return

    // Send initial message
    await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: product.seller_id,
      listing_id: product.id,
      content: `Bonjour, je suis intéressé par "${product.title}" à ${product.price} TND.`,
    })

    router.push(`/dashboard/messages/${product.seller_id}`)
  }

  const reportListing = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }
    if (!product) return

    if (confirm("Voulez-vous signaler cette annonce à l'administration ?")) {
      setIsReporting(true)
      const { error } = await supabase.from("reports").insert({
        listing_id: product.id,
        reporter_id: user.id,
        reason: "Signalé par un utilisateur",
      })

      if (error) {
        toast.error("Erreur lors du signalement")
      } else {
        toast.success("Annonce signalée. Merci pour votre aide !")
      }
      setIsReporting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="h-8 w-8 animate-spin text-success" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="py-40 text-center text-muted-foreground">
        Product not found
      </div>
    )
  }

  const discount = product.market_price
    ? Math.round(((product.market_price - product.price) / product.market_price) * 100)
    : 0
  const savings = product.market_price ? product.market_price - product.price : 0
  const timeAgo = Math.floor((Date.now() - new Date(product.created_at).getTime()) / 60000)

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % product.images.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + product.images.length) % product.images.length)
  }

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

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-secondary">
            {product.images.length > 0 ? (
              <Image
                src={product.images[currentImage]}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No image
              </div>
            )}

            {/* Discount Badge */}
            {discount > 0 && (
              <Badge className="absolute left-4 top-4 bg-success text-success-foreground">
                -{discount}%
              </Badge>
            )}

            {/* Favorite Button */}
            <button
              onClick={toggleFavorite}
              className="absolute right-14 top-4 rounded-full bg-background/80 p-2 backdrop-blur transition-colors hover:bg-background"
            >
              <Heart className={`h-5 w-5 ${isFavorited ? "fill-pink-500 text-pink-500" : "text-foreground"}`} />
            </button>

            {/* Share Button */}
            <button className="absolute right-4 top-4 rounded-full bg-background/80 p-2 backdrop-blur transition-colors hover:bg-background">
              <Share2 className="h-5 w-5 text-foreground" />
            </button>

            {/* Navigation Arrows */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 backdrop-blur transition-colors hover:bg-background"
                >
                  <ChevronLeft className="h-5 w-5 text-foreground" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 backdrop-blur transition-colors hover:bg-background"
                >
                  <ChevronRight className="h-5 w-5 text-foreground" />
                </button>
              </>
            )}
          </div>

          {/* Image Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`relative aspect-square w-20 overflow-hidden rounded-lg border-2 transition-colors ${currentImage === index
                    ? "border-success"
                    : "border-border hover:border-success/50"
                    }`}
                >
                  <Image
                    src={img}
                    alt={`${product.title} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {product.title}
          </h1>

          {/* Price Section */}
          <div className="rounded-xl border border-success/30 bg-success/5 p-6">
            <div className="mb-2 flex items-baseline gap-3">
              <span className="text-4xl font-bold text-success">
                {product.price} TND
              </span>
            </div>
            {product.market_price && (
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>
                  {t("product.marketPrice")}: <span className="line-through">{product.market_price} TND</span>
                </span>
                {savings > 0 && (
                  <Badge variant="secondary" className="bg-success/20 text-success">
                    {t("product.savings")}: {savings} TND
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                {t("product.postedAgo")} {timeAgo} {t("product.min")}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{product.city}</span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h2 className="mb-2 font-semibold text-foreground">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          {/* Seller Info */}
          {seller && (
            <Link
              href={`/seller/${seller.id}`}
              className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-success/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-lg font-semibold text-foreground">
                    {seller.avatar_url ? (
                      <img src={seller.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      seller.display_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {seller.display_name}
                      </span>
                      {seller.verified && (
                        <Badge variant="secondary" className="gap-1 bg-success/10 text-success">
                          <Shield className="h-3 w-3" />
                          {t("profile.verified")}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {seller.rating}
                      </span>
                      <span>{seller.items_sold} {t("profile.itemsSold")}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              size="lg"
              onClick={contactSeller}
              className="flex-1 gap-2 border-foreground text-foreground hover:bg-foreground hover:text-background"
            >
              <MessageCircle className="h-5 w-5" />
              {t("product.contact")}
            </Button>
            <Button
              size="lg"
              onClick={toggleFavorite}
              className="flex-1 gap-2 bg-success text-success-foreground hover:bg-success/90"
            >
              <Heart className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`} />
              {isFavorited ? t("product.removeFavorite") : t("product.addFavorite")}
            </Button>
          </div>

          <button
            onClick={reportListing}
            disabled={isReporting}
            className="mt-4 flex w-full items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-destructive"
          >
            {isReporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
            Signaler cette annonce
          </button>
        </div>
      </div>
    </main>
  )
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ProductContent id={id} />
      <Footer />
      <FloatingSellButton />
    </div>
  )
}
