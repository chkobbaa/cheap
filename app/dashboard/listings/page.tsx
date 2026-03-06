"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BoostCalculator } from "@/components/boost-calculator"
import {
    Package,
    Plus,
    Pencil,
    Trash2,
    Eye,
    Loader2,
    AlertCircle,
    Zap,
    X
} from "lucide-react"

interface Listing {
    id: string
    title: string
    price: number
    market_price: number
    category: string
    city: string
    images: string[]
    status: string
    views: number
    created_at: string
    boost_amount: number
    boost_expires_at: string | null
}

export default function ListingsPage() {
    const { user, profile } = useAuth()
    const { t } = useLanguage()
    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [boosting, setBoosting] = useState<string | null>(null)
    const [isProcessingBoost, setIsProcessingBoost] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if (!user) return
        fetchListings()
    }, [user])

    const fetchListings = async () => {
        setLoading(true)
        const { data } = await supabase
            .from("listings")
            .select("*")
            .eq("seller_id", user!.id)
            .order("created_at", { ascending: false })

        setListings(data || [])
        setLoading(false)
    }

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === "active" ? "closed" : "active"
        await supabase
            .from("listings")
            .update({ status: newStatus })
            .eq("id", id)
        fetchListings()
    }

    const deleteListing = async (id: string) => {
        setDeleting(id)
        await supabase.from("listings").delete().eq("id", id)
        setListings((prev) => prev.filter((l) => l.id !== id))
        setDeleting(null)
    }

    const handleBoost = async (amount: number, days: number) => {
        if (!boosting || !user) return
        setIsProcessingBoost(true)

        // Mock payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + days)

        const listingToBoost = listings.find(l => l.id === boosting)
        const currentBoostAmount = listingToBoost?.boost_amount || 0

        // 1. Update listing
        await supabase
            .from("listings")
            .update({
                boost_amount: currentBoostAmount + amount,
                boost_expires_at: expiresAt.toISOString()
            })
            .eq("id", boosting)

        // 2. Insert transaction
        await supabase
            .from("boost_transactions")
            .insert({
                listing_id: boosting,
                user_id: user.id,
                amount: amount,
                duration_days: days
            })

        setBoosting(null)
        setIsProcessingBoost(false)
        fetchListings()
    }

    const statusColor = (status: string) => {
        switch (status) {
            case "active": return "bg-success/10 text-success border-success/20"
            case "sold": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
            case "draft": return "bg-secondary text-muted-foreground border-border"
            case "closed": return "bg-destructive/10 text-destructive border-destructive/20"
            default: return "bg-secondary text-muted-foreground border-border"
        }
    }

    // Non-seller users shouldn't see this page
    if (profile?.role !== "seller") {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold text-foreground mb-2">{t("dashboard.sellerOnly")}</h2>
                <p className="text-muted-foreground">{t("dashboard.sellerOnlyDesc")}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{t("dashboard.myListings")}</h1>
                    <p className="text-muted-foreground">{listings.length} {t("dashboard.totalListings")}</p>
                </div>
                <Link href="/sell">
                    <Button className="gap-2 bg-success text-success-foreground hover:bg-success/90">
                        <Plus className="h-4 w-4" />
                        {t("dashboard.newListing")}
                    </Button>
                </Link>
            </div>

            {/* Listings */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-success" />
                </div>
            ) : listings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-border bg-card/50">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">{t("dashboard.noListings")}</h3>
                    <p className="text-muted-foreground mb-4">{t("dashboard.noListingsDesc")}</p>
                    <Link href="/sell">
                        <Button className="gap-2 bg-success text-success-foreground hover:bg-success/90">
                            <Plus className="h-4 w-4" />
                            {t("dashboard.createFirst")}
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {listings.map((listing) => {
                        const isBoosted = listing.boost_expires_at && new Date(listing.boost_expires_at) > new Date()
                        return (
                            <div
                                key={listing.id}
                                className={`flex flex-col sm:flex-row gap-4 rounded-2xl border bg-card p-4 transition-all hover:shadow-lg ${isBoosted ? "border-cyan-500/50 shadow-cyan-500/10" : "border-border"
                                    }`}
                            >
                                {/* Image */}
                                {listing.images?.[0] ? (
                                    <div className="w-full sm:w-32 h-40 sm:h-32 rounded-xl overflow-hidden bg-secondary shrink-0 relative">
                                        <img
                                            src={listing.images[0]}
                                            alt={listing.title}
                                            className="w-full h-full object-cover"
                                        />
                                        {isBoosted && (
                                            <div className="absolute top-2 right-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                                <Zap className="w-3 h-3 fill-white" />
                                                BOOSTÉ
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="w-full sm:w-32 h-40 sm:h-32 rounded-xl bg-secondary shrink-0 relative flex justify-center items-center">
                                        <Package className="h-8 w-8 text-muted-foreground/50" />
                                        {isBoosted && (
                                            <div className="absolute top-2 right-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                                <Zap className="w-3 h-3 fill-white" />
                                                BOOSTÉ
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Info */}
                                <div className="flex-1 min-w-0 py-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-lg text-foreground line-clamp-1">{listing.title}</h3>
                                            <p className="text-xl font-bold text-success">{listing.price} TND</p>
                                        </div>
                                        <Badge variant="outline" className={statusColor(listing.status)}>
                                            {listing.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 mt-4 text-xs font-medium text-muted-foreground">
                                        <span className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
                                            <Eye className="h-3.5 w-3.5" />
                                            {listing.views || 0} vues
                                        </span>
                                        <span>{listing.city}</span>
                                        <span className="hidden sm:inline">{listing.category}</span>
                                        <span className="hidden sm:inline">{new Date(listing.created_at).toLocaleDateString("fr-FR")}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex sm:flex-col gap-2 shrink-0 py-1 justify-between">
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleStatus(listing.id, listing.status)}
                                            className="flex-1 sm:flex-none"
                                        >
                                            {listing.status === "active" ? t("dashboard.deactivate") : t("dashboard.activate")}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => deleteListing(listing.id)}
                                            disabled={deleting === listing.id}
                                            className="px-3 text-destructive hover:text-destructive hover:bg-destructive/10 border-border"
                                        >
                                            {deleting === listing.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>

                                    {listing.status === "active" && (
                                        <Button
                                            onClick={() => setBoosting(listing.id)}
                                            className="w-full gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/20 border-0"
                                        >
                                            <Zap className="h-4 w-4 fill-white" />
                                            Booster l'annonce
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Boost Modal */}
            <AnimatePresence>
                {boosting && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isProcessingBoost && setBoosting(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative z-10 w-full max-w-xl"
                        >
                            <button
                                onClick={() => !isProcessingBoost && setBoosting(null)}
                                className="absolute -top-12 right-0 p-2 text-white hover:text-cyan-400 transition-colors"
                            >
                                <X className="w-8 h-8" />
                            </button>
                            <BoostCalculator onBoost={handleBoost} isProcessing={isProcessingBoost} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
