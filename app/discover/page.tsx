"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { createClient } from "@/lib/supabase/client"
import { NavbarMenu } from "@/components/navbar-menu"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { AdBanner } from "@/components/ad-banner"
import { Search, SlidersHorizontal, Loader2 } from "lucide-react"

const mockProducts = [
    { id: "1", title: "iPhone 13 Pro Max 256GB", price: 650, market_price: 900, images: ["https://images.unsplash.com/photo-1632661674596-df8be59a8a7a?w=400&h=400&fit=crop"], city: "Tunis", created_at: new Date(Date.now() - 2 * 60000).toISOString(), category: "phones" },
    { id: "2", title: "PlayStation 5 Digital Edition", price: 450, market_price: 650, images: ["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop"], city: "Sousse", created_at: new Date(Date.now() - 5 * 60000).toISOString(), category: "gaming" },
    { id: "3", title: "MacBook Air M2 2023", price: 1200, market_price: 1650, images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop"], city: "Sfax", created_at: new Date(Date.now() - 8 * 60000).toISOString(), category: "computers" },
    { id: "4", title: "Samsung Galaxy S24 Ultra", price: 580, market_price: 800, images: ["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop"], city: "Tunis", created_at: new Date(Date.now() - 12 * 60000).toISOString(), category: "phones" },
    { id: "5", title: "Nintendo Switch OLED", price: 320, market_price: 450, images: ["https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=400&fit=crop"], city: "Monastir", created_at: new Date(Date.now() - 15 * 60000).toISOString(), category: "gaming" },
    { id: "6", title: "AirPods Pro 2", price: 180, market_price: 280, images: ["https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=400&h=400&fit=crop"], city: "Nabeul", created_at: new Date(Date.now() - 18 * 60000).toISOString(), category: "misc" },
    { id: "7", title: 'iPad Pro 12.9" M2', price: 950, market_price: 1300, images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop"], city: "Bizerte", created_at: new Date(Date.now() - 22 * 60000).toISOString(), category: "computers" },
    { id: "8", title: "Sony WH-1000XM5", price: 220, market_price: 350, images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop"], city: "Gabès", created_at: new Date(Date.now() - 28 * 60000).toISOString(), category: "misc" },
    { id: "9", title: "iPhone 14 Pro 128GB", price: 750, market_price: 1000, images: ["https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&h=400&fit=crop"], city: "Sfax", created_at: new Date(Date.now() - 35 * 60000).toISOString(), category: "phones" },
    { id: "10", title: "Xiaomi 14 Ultra", price: 400, market_price: 550, images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop"], city: "Nabeul", created_at: new Date(Date.now() - 40 * 60000).toISOString(), category: "phones" },
    { id: "11", title: "Machine à laver Samsung", price: 350, market_price: 500, images: ["https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&h=400&fit=crop"], city: "Kairouan", created_at: new Date(Date.now() - 45 * 60000).toISOString(), category: "appliances" },
    { id: "12", title: "Peugeot 208 2019", price: 28000, market_price: 35000, images: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=400&fit=crop"], city: "Tunis", created_at: new Date(Date.now() - 60 * 60000).toISOString(), category: "cars" },
]

const categoryFilters = [
    { value: "all", label: "Tout" },
    { value: "phones", label: "Téléphones" },
    { value: "computers", label: "Ordinateurs" },
    { value: "gaming", label: "Gaming" },
    { value: "appliances", label: "Électroménager" },
    { value: "cars", label: "Voitures" },
    { value: "misc", label: "Divers" },
]

const sortOptions = [
    { value: "recent", label: "Plus récent" },
    { value: "cheapest", label: "Moins cher" },
    { value: "expensive", label: "Plus cher" },
]

export default function DiscoverPage() {
    const { t } = useLanguage()
    const supabase = createClient()
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [category, setCategory] = useState("all")
    const [sort, setSort] = useState("recent")
    const [page, setPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(20)

    // Reset to page 1 string filters change
    useEffect(() => {
        setPage(1)
    }, [search, category, sort, itemsPerPage])

    useEffect(() => {
        fetchProducts()
    }, [category, sort])

    const fetchProducts = async () => {
        setLoading(true)

        try {
            let query = supabase
                .from("listings")
                .select("*")
                .eq("status", "active")
                .limit(1000)

            if (category !== "all") {
                query = query.eq("category", category)
            }

            const queryPromise = query
            const timeoutPromise = new Promise<{ data: any, error: any }>((resolve) =>
                setTimeout(() => resolve({ data: null, error: new Error("Fetch timeout") }), 5000)
            )

            const { data, error } = await Promise.race([queryPromise, timeoutPromise])

            if (error) {
                console.error("Error fetching discover products:", error)
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

                    if (sort === "cheapest") return a.price - b.price
                    if (sort === "expensive") return b.price - a.price
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                })
                setProducts(data)
            } else {
                // Fallback to mock
                let filtered = category === "all"
                    ? mockProducts
                    : mockProducts.filter((p) => p.category === category)

                if (sort === "cheapest") filtered.sort((a, b) => a.price - b.price)
                if (sort === "expensive") filtered.sort((a, b) => b.price - a.price)
                if (sort === "recent") filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

                setProducts(filtered)
            }
        } catch (error) {
            console.error("Failed to load products on discover:", error)
            setProducts(mockProducts)
        } finally {
            setLoading(false)
        }
    }

    const filtered = search
        ? products.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
        : products

    const toCard = (listing: any) => {
        const isBoosted = listing.boost_amount > 0 && listing.boost_expires_at && new Date(listing.boost_expires_at).getTime() > new Date().getTime()

        return {
            id: listing.id,
            title: listing.title,
            price: listing.price,
            marketPrice: listing.market_price || listing.price * 1.3,
            image: listing.images?.[0] || "https://images.unsplash.com/photo-1632661674596-df8be59a8a7a?w=400&h=400&fit=crop",
            location: listing.city,
            postedMinutesAgo: Math.max(1, Math.floor((Date.now() - new Date(listing.created_at).getTime()) / 60000)),
            isBoosted,
        }
    }

    const paginatedProducts = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage)
    const totalPages = Math.ceil(filtered.length / itemsPerPage)

    return (
        <div className="min-h-screen bg-black text-white">
            <NavbarMenu />

            <main className="mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 pt-4">
                    <h1 className="text-3xl font-bold text-white sm:text-4xl mb-2">Découvrir</h1>
                    <p className="text-neutral-500">Trouvez les meilleures affaires en Tunisie</p>
                </div>

                {/* Filters Bar */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                        <Input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher..."
                            className="h-11 pl-10 bg-white/5 border-white/10 text-white placeholder:text-neutral-600 rounded-full"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Category Filter */}
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                                <SlidersHorizontal className="h-4 w-4 mr-2 text-neutral-400" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-900 border-white/10">
                                {categoryFilters.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value} className="text-white hover:bg-white/10">
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Sort */}
                        <Select value={sort} onValueChange={setSort}>
                            <SelectTrigger className="w-36 bg-white/5 border-white/10 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-900 border-white/10">
                                {sortOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value} className="text-white hover:bg-white/10">
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Category Pills */}
                <div className="mb-8 flex flex-wrap gap-2">
                    {categoryFilters.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => setCategory(cat.value)}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${category === cat.value
                                ? "bg-white text-black"
                                : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white border border-white/10"
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Results count & Items per page */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-sm text-neutral-500">
                        {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
                    </p>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-500">Par page :</span>
                        <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
                            <SelectTrigger className="w-20 bg-white/5 border-white/10 text-white h-9 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-900 border-white/10">
                                <SelectItem value="20" className="text-white hover:bg-white/10">20</SelectItem>
                                <SelectItem value="40" className="text-white hover:bg-white/10">40</SelectItem>
                                <SelectItem value="100" className="text-white hover:bg-white/10">100</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Advertisement slot */}
                <div className="mb-10 w-full">
                    <AdBanner format="horizontal" />
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                    </div>
                ) : filtered.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                            {paginatedProducts.map((product, index) => {
                                const cardProps = toCard(product)
                                return (
                                    <ProductCard
                                        key={product.id}
                                        {...cardProps}
                                        isTopBoosted={page === 1 && index === 0 && cardProps.isBoosted}
                                    />
                                )
                            })}
                        </div>

                        {/* Pagination UI */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-8">
                                <p className="text-sm text-neutral-500">
                                    Affichage de <span className="text-white font-medium">{(page - 1) * itemsPerPage + 1}</span> à <span className="text-white font-medium">{Math.min(page * itemsPerPage, filtered.length)}</span> sur <span className="text-white font-medium">{filtered.length}</span>
                                </p>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 border-white/10 text-white hover:bg-white/10"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        Précédent
                                    </Button>

                                    <div className="flex items-center gap-1 mx-2">
                                        {[...Array(totalPages)].map((_, idx) => {
                                            const p = idx + 1
                                            if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                                                return (
                                                    <button
                                                        key={p}
                                                        onClick={() => setPage(p)}
                                                        className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${page === p ? "bg-white text-black" : "text-neutral-400 hover:text-white hover:bg-white/10"
                                                            }`}
                                                    >
                                                        {p}
                                                    </button>
                                                )
                                            } else if (p === page - 2 || p === page + 2) {
                                                return <span key={p} className="text-neutral-600 px-1">...</span>
                                            }
                                            return null
                                        })}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 border-white/10 text-white hover:bg-white/10"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                    >
                                        Suivant
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-lg text-neutral-400 mb-2">Aucun résultat</p>
                        <p className="text-sm text-neutral-600">Essayez un autre filtre ou une recherche différente</p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
