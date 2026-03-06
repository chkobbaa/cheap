"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { ShieldAlert, LayoutDashboard, Package, Users, LogOut, Flag } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [isAuthorized, setIsAuthorized] = useState(false)

    useEffect(() => {
        if (loading) return

        if (!user || user.email !== "razerhumbergur@gmail.com") {
            setIsAuthorized(false)
        } else {
            setIsAuthorized(true)
        }
    }, [user, loading])

    if (loading) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white">Chargement...</div>
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-4">
                <ShieldAlert className="w-16 h-16 text-red-500 mb-6" />
                <h1 className="text-3xl font-bold text-white mb-2">Accès Refusé</h1>
                <p className="text-neutral-400 max-w-md">
                    Cette zone est strictement réservée à l'administration de cheap.tn.
                </p>
                <Link href="/" className="mt-8 text-cyan-400 hover:text-cyan-300 font-medium border border-cyan-500/30 px-6 py-2 rounded-full">
                    Retour à l'accueil
                </Link>
            </div>
        )
    }

    const navItems = [
        { name: "Vue d'ensemble", href: "/admin", icon: LayoutDashboard },
        { name: "Annonces", href: "/admin/products", icon: Package },
        { name: "Utilisateurs", href: "/admin/users", icon: Users },
        { name: "Signalements", href: "/admin/reports", icon: Flag },
    ]

    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-black border-r border-white/10 flex-shrink-0 flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <Link href="/admin" className="flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                        <span className="text-xl font-bold text-white tracking-tight">Admin<span className="text-red-500">.tn</span></span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? "bg-red-500/10 text-red-400 font-medium"
                                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <LogOut className="w-5 h-5" />
                        Quitter l'admin
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-neutral-950 text-white">
                {children}
            </main>
        </div>
    )
}
