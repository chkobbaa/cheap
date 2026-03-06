"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"
import { Users, Package, Zap, DollarSign, Database, Loader2, CheckCircle2, TrendingUp, Clock } from "lucide-react"

export default function AdminDashboard() {
    const { user } = useAuth()
    const supabase = createClient()
    const [stats, setStats] = useState({
        users: 0,
        listings: 0,
        boosts: 0,
        revenue: 0,
    })
    const [recentBoosts, setRecentBoosts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [seedingLoading, setSeedingLoading] = useState(false)
    const [seedingSuccess, setSeedingSuccess] = useState(false)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        setLoading(true)

        try {
            const [usersRes, listingsRes, boostsRes, recentBoostsRes] = await Promise.all([
                supabase.from("profiles").select("id", { count: "exact", head: true }),
                supabase.from("listings").select("id", { count: "exact", head: true }),
                supabase.from("boost_transactions").select("amount"),
                supabase.from("boost_transactions").select("*, profiles(display_name), listings(title)").order("created_at", { ascending: false }).limit(5)
            ])

            const totalRevenue = boostsRes.data?.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0) || 0
            const totalBoosts = boostsRes.data?.length || 0

            setRecentBoosts(recentBoostsRes.data || [])

            setStats({
                users: usersRes.count || 0,
                listings: listingsRes.count || 0,
                boosts: totalBoosts,
                revenue: totalRevenue
            })
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleSeedData = async () => {
        if (!user) return

        if (!confirm("Voulez-vous vraiment injecter les 100 produits de démonstration ?")) return

        setSeedingLoading(true)
        setSeedingSuccess(false)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            const res = await fetch("/api/admin/seed", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer MY_SECRET_SEED_KEY_123"
                },
                body: JSON.stringify({
                    seller_id: user.id,
                    access_token: session?.access_token
                })
            })

            if (!res.ok) {
                const errData = await res.json()
                console.error("Seed API failed:", errData)
                throw new Error(errData.error || "Failed to seed")
            }

            setSeedingSuccess(true)
            fetchStats() // Refresh stats

            setTimeout(() => setSeedingSuccess(false), 5000)
        } catch (error) {
            console.error(error)
            alert("Erreur lors de l'injection.")
        } finally {
            setSeedingLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
                <div>
                    <div className="h-8 w-48 bg-white/10 rounded mb-2" />
                    <div className="h-4 w-64 bg-white/5 rounded" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 h-32 flex flex-col justify-between">
                            <div className="w-12 h-12 bg-white/5 rounded-xl" />
                            <div>
                                <div className="h-8 w-24 bg-white/10 rounded mb-2" />
                                <div className="h-4 w-32 bg-white/5 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Vue d'ensemble</h1>
                <p className="text-neutral-400">Bienvenue dans le centre de contrôle de cheap.tn.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Utilisateurs Inscrits"
                    value={stats.users.toString()}
                    icon={Users}
                    color="text-blue-400"
                    bg="bg-blue-500/10"
                />
                <StatCard
                    title="Annonces Publiées"
                    value={stats.listings.toString()}
                    icon={Package}
                    color="text-emerald-400"
                    bg="bg-emerald-500/10"
                />
                <StatCard
                    title="Transactions Boost"
                    value={stats.boosts.toString()}
                    icon={Zap}
                    color="text-amber-400"
                    bg="bg-amber-500/10"
                />
                <StatCard
                    title="Revenu Total (TND)"
                    value={`${stats.revenue.toFixed(2)}`}
                    icon={DollarSign}
                    color="text-cyan-400"
                    bg="bg-cyan-500/10"
                />
            </div>

            {/* Quick Actions */}
            <div className="mt-12">
                <h2 className="text-xl font-bold text-white mb-6">Actions Rapides</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Seed Action */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                            <Database className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Générer Fausse Data</h3>
                        <p className="text-sm text-neutral-400 mb-6">
                            Injecte 100 vrais-faux produits (vélos, tel, voitures) pour remplir le site. Ils seront assignés à votre compte.
                        </p>

                        <button
                            onClick={handleSeedData}
                            disabled={seedingLoading}
                            className="w-full flex justify-center items-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10 cursor-pointer disabled:opacity-50"
                        >
                            {seedingLoading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Injection...</>
                            ) : seedingSuccess ? (
                                <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Injection Réussie</>
                            ) : (
                                "Lancer l'injection"
                            )}
                        </button>
                    </div>

                    {/* Recent Activity */}
                    <div className="sm:col-span-2 lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            <h3 className="text-lg font-bold text-white">Activité Récente (Boosts)</h3>
                        </div>

                        {recentBoosts.length > 0 ? (
                            <div className="space-y-4">
                                {recentBoosts.map((boost) => (
                                    <div key={boost.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                <Zap className="w-5 h-5 text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium text-sm">
                                                    {boost.profiles?.display_name || "Utilisateur"} a boosté "{boost.listings?.title || "une annonce"}"
                                                </p>
                                                <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(boost.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-emerald-400 font-bold inline-block bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                                                +{boost.amount} TND
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-neutral-500">
                                <p>Aucune activité récente.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${bg}`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
            </div>
            <div className="mt-auto">
                <h3 className="text-3xl font-black text-white mb-1">{value}</h3>
                <p className="text-sm font-medium text-neutral-500">{title}</p>
            </div>
        </div>
    )
}
