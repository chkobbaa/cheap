"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import { createClient } from "@/lib/supabase/client"
import {
    Package,
    Heart,
    MessageCircle,
    Eye,
    TrendingUp,
    Plus,
    ArrowRight,
    Store,
    ShoppingBag,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardStats {
    activeListings: number
    totalViews: number
    favorites: number
    unreadMessages: number
}

export default function DashboardPage() {
    const { user, profile } = useAuth()
    const { t } = useLanguage()
    const [stats, setStats] = useState<DashboardStats>({
        activeListings: 0,
        totalViews: 0,
        favorites: 0,
        unreadMessages: 0,
    })
    const [recentListings, setRecentListings] = useState<any[]>([])
    const supabase = createClient()

    const isSeller = profile?.role === "seller"

    useEffect(() => {
        if (!user) return

        const fetchStats = async () => {
            // Favorites count
            const { count: favCount } = await supabase
                .from("favorites")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id)

            // Unread messages
            const { count: msgCount } = await supabase
                .from("messages")
                .select("*", { count: "exact", head: true })
                .eq("receiver_id", user.id)
                .eq("read", false)

            if (isSeller) {
                // Active listings
                const { count: listCount } = await supabase
                    .from("listings")
                    .select("*", { count: "exact", head: true })
                    .eq("seller_id", user.id)
                    .eq("status", "active")

                // Total views
                const { data: viewsData } = await supabase
                    .from("listings")
                    .select("views")
                    .eq("seller_id", user.id)

                const totalViews = viewsData?.reduce((sum: number, l: any) => sum + (l.views || 0), 0) || 0

                // Recent listings
                const { data: recent } = await supabase
                    .from("listings")
                    .select("*")
                    .eq("seller_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(4)

                setStats({
                    activeListings: listCount || 0,
                    totalViews,
                    favorites: favCount || 0,
                    unreadMessages: msgCount || 0,
                })
                setRecentListings(recent || [])
            } else {
                setStats({
                    activeListings: 0,
                    totalViews: 0,
                    favorites: favCount || 0,
                    unreadMessages: msgCount || 0,
                })
            }
        }

        fetchStats()
    }, [user, isSeller])

    const sellerCards = [
        { label: t("dashboard.activeListings"), value: stats.activeListings, icon: Package, color: "text-success", bg: "bg-success/10" },
        { label: t("dashboard.totalViews"), value: stats.totalViews, icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: t("dashboard.favorites"), value: stats.favorites, icon: Heart, color: "text-pink-500", bg: "bg-pink-500/10" },
        { label: t("dashboard.unreadMessages"), value: stats.unreadMessages, icon: MessageCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
    ]

    const buyerCards = [
        { label: t("dashboard.favorites"), value: stats.favorites, icon: Heart, color: "text-pink-500", bg: "bg-pink-500/10" },
        { label: t("dashboard.unreadMessages"), value: stats.unreadMessages, icon: MessageCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
    ]

    const statCards = isSeller ? sellerCards : buyerCards

    return (
        <div className="space-y-8 pb-20 md:pb-0">
            {/* Welcome */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                        {t("dashboard.welcome")}, {profile?.display_name || user?.email?.split("@")[0]} 👋
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {isSeller ? t("dashboard.sellerSubtitle") : t("dashboard.buyerSubtitle")}
                    </p>
                </div>
                {isSeller && (
                    <Link href="/sell">
                        <Button className="gap-2 bg-success text-success-foreground hover:bg-success/90">
                            <Plus className="h-4 w-4" />
                            {t("dashboard.newListing")}
                        </Button>
                    </Link>
                )}
            </div>

            {/* Stats Grid */}
            <div className={`grid gap-4 ${isSeller ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2"}`}>
                {statCards.map((card) => {
                    const Icon = card.icon
                    return (
                        <div
                            key={card.label}
                            className="rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg}`}>
                                    <Icon className={`h-5 w-5 ${card.color}`} />
                                </div>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-3xl font-bold text-foreground">{card.value}</p>
                            <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
                        </div>
                    )
                })}
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {isSeller && (
                    <Link href="/sell" className="group">
                        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-success/50 hover:shadow-md">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                                <Store className="h-6 w-6 text-success" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-foreground">{t("dashboard.sellItem")}</p>
                                <p className="text-sm text-muted-foreground">{t("dashboard.sellItemDesc")}</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-success transition-colors" />
                        </div>
                    </Link>
                )}
                <Link href="/" className="group">
                    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-success/50 hover:shadow-md">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                            <ShoppingBag className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-foreground">{t("dashboard.browseDeals")}</p>
                            <p className="text-sm text-muted-foreground">{t("dashboard.browseDealsDesc")}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                    </div>
                </Link>
                <Link href="/dashboard/messages" className="group">
                    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-success/50 hover:shadow-md">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                            <MessageCircle className="h-6 w-6 text-amber-500" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-foreground">{t("dashboard.viewMessages")}</p>
                            <p className="text-sm text-muted-foreground">{t("dashboard.viewMessagesDesc")}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                    </div>
                </Link>
            </div>

            {/* Recent Listings (Seller Only) */}
            {isSeller && recentListings.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-foreground">{t("dashboard.recentListings")}</h2>
                        <Link href="/dashboard/listings" className="text-sm text-success hover:text-success/80">
                            {t("dashboard.viewAll")} →
                        </Link>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {recentListings.map((listing) => (
                            <div
                                key={listing.id}
                                className="rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-md"
                            >
                                {listing.images?.[0] && (
                                    <div className="aspect-square relative bg-secondary">
                                        <img
                                            src={listing.images[0]}
                                            alt={listing.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-xs font-medium ${listing.status === "active"
                                            ? "bg-success text-success-foreground"
                                            : listing.status === "sold"
                                                ? "bg-blue-500 text-white"
                                                : "bg-secondary text-muted-foreground"
                                            }`}>
                                            {listing.status}
                                        </div>
                                    </div>
                                )}
                                <div className="p-4">
                                    <h3 className="font-medium text-foreground line-clamp-1">{listing.title}</h3>
                                    <p className="text-lg font-bold text-success mt-1">{listing.price} TND</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {listing.views || 0} {t("dashboard.views")} • {listing.city}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
