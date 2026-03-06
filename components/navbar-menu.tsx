"use client"

import { useState, useRef, useEffect, ReactNode } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import {
    User,
    LayoutDashboard,
    Package,
    Settings,
    LogOut,
    ShieldAlert,
    Heart,
    MessageCircle,
    Search,
} from "lucide-react"

interface MenuItemProps {
    label: string
    href: string
    children?: ReactNode
}

function MenuItem({ label, href, children }: MenuItemProps) {
    const [isHovered, setIsHovered] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setIsHovered(true)
    }

    const handleLeave = () => {
        timeoutRef.current = setTimeout(() => setIsHovered(false), 100)
    }

    return (
        <div
            className="relative"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
        >
            <Link href={href}>
                <motion.span
                    className="relative px-4 py-2 text-sm text-neutral-400 transition-colors hover:text-white cursor-pointer"
                    whileHover={{ color: "#ffffff" }}
                >
                    {label}
                    {isHovered && (
                        <motion.span
                            className="absolute inset-x-2 -bottom-0.5 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                            layoutId="navbar-underline"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        />
                    )}
                </motion.span>
            </Link>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isHovered && children && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute left-1/2 -translate-x-1/2 top-full pt-3"
                    >
                        <div className="min-w-[240px] rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl p-4 shadow-2xl shadow-black/40">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export function NavbarMenu() {
    const { t } = useLanguage()
    const { user, profile, signOut } = useAuth()
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? "bg-black/80 backdrop-blur-xl border-b border-white/5"
                : "bg-transparent"
                }`}
        >
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-0.5">
                    <span className="text-lg font-semibold text-white tracking-tight">cheap</span>
                    <span className="text-lg font-semibold text-emerald-400 tracking-tight">.tn</span>
                </Link>

                {/* Center Menu Items */}
                <div className="hidden md:flex items-center gap-1">
                    <MenuItem label={t("nav.buy")} href="/discover" />
                    <MenuItem label={t("nav.sell")} href="/sell" />
                    <MenuItem label={t("nav.categories")} href="/categories">
                        <div className="grid grid-cols-2 gap-2">
                            {["phones", "computers", "gaming", "appliances", "cars", "misc"].map((cat) => (
                                <Link
                                    key={cat}
                                    href={`/categories/${cat}`}
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    {t(`cat.${cat}`)}
                                </Link>
                            ))}
                        </div>
                    </MenuItem>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Mobile Discover link */}
                    <Link
                        href="/discover"
                        className="md:hidden flex items-center justify-center p-1.5 text-neutral-400 hover:text-white transition-colors"
                    >
                        <Search className="h-5 w-5" />
                    </Link>

                    {/* Language */}
                    <LanguageSwitch />

                    {/* Auth */}
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-4 border-r border-white/10 pr-4">
                                <Link
                                    href="/dashboard/favorites"
                                    className="text-neutral-400 hover:text-rose-400 transition-colors"
                                    title="Favoris"
                                >
                                    <Heart className="h-5 w-5" />
                                </Link>
                                <Link
                                    href="/dashboard/messages"
                                    className="text-neutral-400 hover:text-emerald-400 transition-colors"
                                    title="Messages"
                                >
                                    <MessageCircle className="h-5 w-5" />
                                </Link>
                            </div>
                            <UserMenu user={user} profile={profile} signOut={signOut} t={t} />
                        </div>
                    ) : (
                        <Link
                            href="/auth/login"
                            className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white hover:bg-white/15 transition-colors"
                        >
                            <User className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{t("nav.login")}</span>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}

function LanguageSwitch() {
    const { language, setLanguage } = useLanguage()

    return (
        <div className="flex items-center rounded-full bg-white/5 p-0.5">
            <button
                onClick={() => setLanguage("fr")}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${language === "fr"
                    ? "bg-white/15 text-white"
                    : "text-neutral-500 hover:text-neutral-300"
                    }`}
            >
                FR
            </button>
            <button
                onClick={() => setLanguage("en")}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${language === "en"
                    ? "bg-white/15 text-white"
                    : "text-neutral-500 hover:text-neutral-300"
                    }`}
            >
                EN
            </button>
        </div>
    )
}

function UserMenu({ user, profile, signOut, t }: any) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white hover:ring-2 hover:ring-emerald-400/30 hover:ring-offset-2 hover:ring-offset-black transition-all"
            >
                {profile?.display_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl p-2 shadow-2xl"
                    >
                        <div className="px-3 py-2 mb-1">
                            <p className="text-sm font-medium text-white truncate">
                                {profile?.display_name || user.email?.split("@")[0]}
                            </p>
                            <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                        </div>
                        <div className="h-px bg-white/10 my-1" />
                        {user.email === "razerhumbergur@gmail.com" && (
                            <Link href="/admin" onClick={() => setOpen(false)}>
                                <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:text-white hover:bg-red-500/20 font-medium transition-colors bg-red-500/10 mb-1">
                                    <ShieldAlert className="h-4 w-4" />
                                    Panel Admin
                                </div>
                            </Link>
                        )}
                        <Link href="/dashboard" onClick={() => setOpen(false)}>
                            <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors">
                                <LayoutDashboard className="h-4 w-4" />
                                {t("nav.dashboard")}
                            </div>
                        </Link>
                        <Link href="/dashboard/listings" onClick={() => setOpen(false)}>
                            <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors">
                                <Package className="h-4 w-4" />
                                {t("nav.myListings")}
                            </div>
                        </Link>
                        <Link href="/dashboard/settings" onClick={() => setOpen(false)}>
                            <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors">
                                <Settings className="h-4 w-4" />
                                {t("nav.settings")}
                            </div>
                        </Link>
                        <div className="h-px bg-white/10 my-1" />
                        <button
                            onClick={() => { signOut(); setOpen(false) }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            {t("nav.logout")}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
