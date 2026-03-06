"use client"

import { use } from "react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { NavbarMenu as Navbar } from "@/components/navbar-menu"
import { ProductCard } from "@/components/product-card"
import { FloatingSellButton } from "@/components/floating-sell-button"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ArrowDown, Clock, MapPin, SlidersHorizontal } from "lucide-react"
import { useState } from "react"

const categoryNames: Record<string, { fr: string; en: string }> = {
  phones: { fr: "Téléphones", en: "Phones" },
  computers: { fr: "Ordinateurs", en: "Computers" },
  gaming: { fr: "Gaming", en: "Gaming" },
  appliances: { fr: "Électroménager", en: "Appliances" },
  cars: { fr: "Voitures", en: "Cars" },
  misc: { fr: "Divers", en: "Misc" },
}

// Mock products per category
const categoryProducts: Record<string, Array<{
  id: string
  title: string
  price: number
  marketPrice: number
  image: string
  location: string
  postedMinutesAgo: number
}>> = {
  phones: [
    { id: "1", title: "iPhone 13 Pro Max 256GB", price: 650, marketPrice: 900, image: "https://images.unsplash.com/photo-1632661674596-df8be59a8a7a?w=400&h=400&fit=crop", location: "Tunis", postedMinutesAgo: 2 },
    { id: "4", title: "Samsung Galaxy S24 Ultra", price: 580, marketPrice: 800, image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop", location: "Tunis", postedMinutesAgo: 12 },
    { id: "9", title: "iPhone 14 Pro 128GB", price: 750, marketPrice: 1000, image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&h=400&fit=crop", location: "Sfax", postedMinutesAgo: 25 },
    { id: "10", title: "Xiaomi 14 Ultra", price: 400, marketPrice: 550, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop", location: "Nabeul", postedMinutesAgo: 35 },
  ],
  computers: [
    { id: "3", title: "MacBook Air M2 2023", price: 1200, marketPrice: 1650, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop", location: "Sfax", postedMinutesAgo: 8 },
    { id: "7", title: "iPad Pro 12.9\" M2", price: 950, marketPrice: 1300, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop", location: "Bizerte", postedMinutesAgo: 22 },
  ],
  gaming: [
    { id: "2", title: "PlayStation 5 Digital Edition", price: 450, marketPrice: 650, image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop", location: "Sousse", postedMinutesAgo: 5 },
    { id: "5", title: "Nintendo Switch OLED", price: 320, marketPrice: 450, image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=400&fit=crop", location: "Monastir", postedMinutesAgo: 15 },
  ],
  appliances: [
    { id: "11", title: "Machine à laver Samsung", price: 350, marketPrice: 500, image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&h=400&fit=crop", location: "Kairouan", postedMinutesAgo: 45 },
  ],
  cars: [
    { id: "12", title: "Peugeot 208 2019", price: 28000, marketPrice: 35000, image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=400&fit=crop", location: "Tunis", postedMinutesAgo: 60 },
  ],
  misc: [
    { id: "6", title: "AirPods Pro 2", price: 180, marketPrice: 280, image: "https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=400&h=400&fit=crop", location: "Nabeul", postedMinutesAgo: 18 },
    { id: "8", title: "Sony WH-1000XM5", price: 220, marketPrice: 350, image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop", location: "Gabès", postedMinutesAgo: 28 },
  ],
}

function CategoryContent({ slug }: { slug: string }) {
  const { t, language } = useLanguage()
  const [sortBy, setSortBy] = useState("cheapest")
  const [showFilters, setShowFilters] = useState(false)

  const categoryName = categoryNames[slug]?.[language] || slug
  const products = categoryProducts[slug] || []

  // Sort products based on selected filter
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "cheapest":
        return a.price - b.price
      case "recent":
        return a.postedMinutesAgo - b.postedMinutesAgo
      case "discount":
        const discountA = (a.marketPrice - a.price) / a.marketPrice
        const discountB = (b.marketPrice - b.price) / b.marketPrice
        return discountB - discountA
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/categories"
            className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("nav.categories")}
          </Link>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            {categoryName}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {products.length} articles
          </p>
        </div>

        {/* Filters Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={sortBy === "cheapest" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("cheapest")}
              className={sortBy === "cheapest" ? "bg-success text-success-foreground hover:bg-success/90" : ""}
            >
              <ArrowDown className="mr-1 h-4 w-4" />
              {t("filter.cheapest")}
            </Button>
            <Button
              variant={sortBy === "recent" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("recent")}
              className={sortBy === "recent" ? "bg-success text-success-foreground hover:bg-success/90" : ""}
            >
              <Clock className="mr-1 h-4 w-4" />
              {t("filter.recent")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <SlidersHorizontal className="mr-1 h-4 w-4" />
              Filtres
            </Button>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toute la Tunisie</SelectItem>
                <SelectItem value="tunis">Tunis</SelectItem>
                <SelectItem value="sousse">Sousse</SelectItem>
                <SelectItem value="sfax">Sfax</SelectItem>
                <SelectItem value="nabeul">Nabeul</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile Filters */}
        {showFilters && (
          <div className="mb-6 rounded-xl border border-border bg-card p-4 lg:hidden">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  {t("filter.distance")}
                </label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toute la Tunisie</SelectItem>
                    <SelectItem value="tunis">Tunis</SelectItem>
                    <SelectItem value="sousse">Sousse</SelectItem>
                    <SelectItem value="sfax">Sfax</SelectItem>
                    <SelectItem value="nabeul">Nabeul</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">
              Aucun article dans cette catégorie pour le moment.
            </p>
          </div>
        )}
      </main>

      <FloatingSellButton />
    </div>
  )
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)

  return (
    <CategoryContent slug={slug} />
  )
}
