"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import { createClient } from "@/lib/supabase/client"
import { Heart, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FavoriteListing {
    id: string
    listing_id: string
    listings: {
        id: string
        title: string
        price: number
        market_price: number
        images: string[]
        city: string
        status: string
    }
}

export default function FavoritesPage() {
    const { user } = useAuth()
    const { t } = useLanguage()
    const [favorites, setFavorites] = useState<FavoriteListing[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        if (!user) return
        fetchFavorites()
    }, [user])

    const fetchFavorites = async () => {
        setLoading(true)
        const { data } = await supabase
            .from("favorites")
            .select("id, listing_id, listings(id, title, price, market_price, images, city, status)")
            .eq("user_id", user!.id)
            .order("created_at", { ascending: false })

        setFavorites((data as any) || [])
        setLoading(false)
    }

    const removeFavorite = async (favId: string) => {
        await supabase.from("favorites").delete().eq("id", favId)
        setFavorites((prev) => prev.filter((f) => f.id !== favId))
    }

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            <div>
                <h1 className="text-2xl font-bold text-foreground">{t("dashboard.favorites")}</h1>
                <p className="text-muted-foreground">{favorites.length} {t("dashboard.savedItems")}</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-success" />
                </div>
            ) : favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-border">
                    <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">{t("dashboard.noFavorites")}</h3>
                    <p className="text-muted-foreground mb-4">{t("dashboard.noFavoritesDesc")}</p>
                    <Link href="/">
                        <Button variant="outline">{t("dashboard.browseDeals")}</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {favorites.map((fav) => {
                        const listing = fav.listings
                        if (!listing) return null
                        const discount = listing.market_price
                            ? Math.round(((listing.market_price - listing.price) / listing.market_price) * 100)
                            : 0

                        return (
                            <div
                                key={fav.id}
                                className="rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-md group relative"
                            >
                                <Link href={`/product/${listing.id}`}>
                                    <div className="aspect-square relative bg-secondary">
                                        {listing.images?.[0] && (
                                            <img
                                                src={listing.images[0]}
                                                alt={listing.title}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            />
                                        )}
                                        {discount > 0 && (
                                            <div className="absolute top-3 left-3 rounded-full bg-success px-2.5 py-1 text-xs font-bold text-success-foreground">
                                                -{discount}%
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-medium text-foreground line-clamp-1">{listing.title}</h3>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <span className="text-lg font-bold text-success">{listing.price} TND</span>
                                            {listing.market_price && (
                                                <span className="text-sm text-muted-foreground line-through">
                                                    {listing.market_price} TND
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">{listing.city}</p>
                                    </div>
                                </Link>
                                <button
                                    onClick={() => removeFavorite(fav.id)}
                                    className="absolute top-3 right-3 rounded-full bg-background/80 backdrop-blur p-2 text-pink-500 hover:bg-background transition-colors"
                                >
                                    <Heart className="h-4 w-4 fill-current" />
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
