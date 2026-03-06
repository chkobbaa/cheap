"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import { motion } from "motion/react"
import {
    LayoutDashboard,
    Package,
    Heart,
    MessageCircle,
    Settings,
    LogOut,
    ChevronLeft,
    Store,
    ShoppingBag,
    Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const sellerNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, labelKey: "dashboard.overview" },
    { href: "/dashboard/listings", icon: Package, labelKey: "dashboard.myListings" },
    { href: "/dashboard/favorites", icon: Heart, labelKey: "dashboard.favorites" },
    { href: "/dashboard/messages", icon: MessageCircle, labelKey: "dashboard.messages" },
    { href: "/dashboard/settings", icon: Settings, labelKey: "dashboard.settings" },
]

const buyerNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, labelKey: "dashboard.overview" },
    { href: "/dashboard/favorites", icon: Heart, labelKey: "dashboard.favorites" },
    { href: "/dashboard/messages", icon: MessageCircle, labelKey: "dashboard.messages" },
    { href: "/dashboard/settings", icon: Settings, labelKey: "dashboard.settings" },
]

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, profile, loading, signOut } = useAuth()
    const { t } = useLanguage()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth/login?redirect=/dashboard")
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-success" />
            </div>
        )
    }

    if (!user) return null

    const isSeller = profile?.role === "seller"
    const navItems = isSeller ? sellerNavItems : buyerNavItems

    const handleSignOut = async () => {
        await signOut()
        router.push("/")
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Top bar */}
            <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-16 items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-1">
                            <span className="text-xl font-bold text-foreground">cheap</span>
                            <span className="text-xl font-bold text-success">.tn</span>
                        </Link>
                        <div className="hidden sm:flex items-center gap-1 rounded-full bg-secondary px-3 py-1">
                            {isSeller ? (
                                <>
                                    <Store className="h-3.5 w-3.5 text-success" />
                                    <span className="text-xs font-medium text-foreground">{t("dashboard.seller")}</span>
                                </>
                            ) : (
                                <>
                                    <ShoppingBag className="h-3.5 w-3.5 text-success" />
                                    <span className="text-xs font-medium text-foreground">{t("dashboard.buyer")}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                                <ChevronLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">{t("dashboard.backToSite")}</span>
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-sm font-bold text-success-foreground">
                                {profile?.display_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <span className="hidden sm:block text-sm font-medium text-foreground">
                                {profile?.display_name || user.email?.split("@")[0]}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Desktop Sidebar */}
                <aside className="hidden md:flex fixed left-0 top-16 bottom-0 w-64 flex-col border-r border-border bg-card/50 p-4">
                    <nav className="flex-1 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <Link key={item.href} href={item.href}>
                                    <motion.div
                                        whileHover={{ x: 4 }}
                                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${isActive
                                                ? "bg-success/10 text-success"
                                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                            }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {t(item.labelKey)}
                                    </motion.div>
                                </Link>
                            )
                        })}
                    </nav>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                        <LogOut className="h-5 w-5" />
                        {t("dashboard.logout")}
                    </button>
                </aside>

                {/* Main content */}
                <main className="flex-1 md:ml-64 min-h-[calc(100vh-4rem)]">
                    <div className="p-4 sm:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Dock */}
            <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center justify-around px-2 py-2">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link key={item.href} href={item.href}>
                                <motion.div
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`flex flex-col items-center gap-1 rounded-xl p-2 ${isActive ? "text-success" : "text-muted-foreground"
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
                                </motion.div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
