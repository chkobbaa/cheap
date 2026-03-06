"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Trash2, Eye, ExternalLink, ShieldAlert, Search, ChevronLeft, ChevronRight, Filter } from "lucide-react"

export default function AdminProductsPage() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<string | null>(null)

    // Pagination & Filters
    const [page, setPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [searchTerm, setSearchTerm] = useState("")
    const [appliedSearch, setAppliedSearch] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("all")

    const ITEMS_PER_PAGE = 20
    const supabase = createClient()

    useEffect(() => {
        const timer = setTimeout(() => {
            setAppliedSearch(searchTerm)
            setPage(1) // Reset to page 1 on new search
        }, 500)
        return () => clearTimeout(timer)
    }, [searchTerm])

    useEffect(() => {
        fetchProducts()
    }, [page, appliedSearch, categoryFilter])

    const fetchProducts = async () => {
        setLoading(true)
        try {
            let query = supabase
                .from("listings")
                .select(`*, profiles(display_name)`, { count: 'exact' })

            if (appliedSearch) {
                query = query.or(`title.ilike.%${appliedSearch}%,city.ilike.%${appliedSearch}%`)
            }
            if (categoryFilter !== "all") {
                query = query.eq("category", categoryFilter)
            }

            const from = (page - 1) * ITEMS_PER_PAGE
            const to = from + ITEMS_PER_PAGE - 1

            const { data, count } = await query
                .order("created_at", { ascending: false })
                .range(from, to)

            setProducts(data || [])
            setTotalCount(count || 0)
        } finally {
            setLoading(false)
        }
    }

    const deleteProduct = async (id: string) => {
        if (!confirm("Voulez-vous vraiment supprimer cette annonce définitivement ?")) return
        setDeleting(id)

        await supabase.from("listings").delete().eq("id", id)

        setProducts(prev => prev.filter(p => p.id !== id))
        setDeleting(null)
    }

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === "active" ? "closed" : "active"

        await supabase.from("listings").update({ status: newStatus }).eq("id", id)

        setProducts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p))
    }

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Gestion des Annonces {totalCount > 0 && <span className="text-neutral-500 text-base font-normal">({totalCount})</span>}</h1>
                    <p className="text-neutral-400">Gérez toutes les annonces publiées sur le site.</p>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Rechercher annonce ou ville..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500/50 w-full sm:w-64"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                            className="bg-black border border-white/10 rounded-lg pl-9 pr-8 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 appearance-none w-full sm:w-auto"
                        >
                            <option value="all">Toutes les catégories</option>
                            <option value="phones">Téléphones</option>
                            <option value="computers">Ordinateurs</option>
                            <option value="gaming">Gaming</option>
                            <option value="appliances">Électroménager</option>
                            <option value="cars">Véhicules</option>
                            <option value="misc">Divers</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-neutral-300">
                        <thead className="bg-white/5 text-xs uppercase text-neutral-400">
                            <tr>
                                <th className="px-6 py-4">Produit</th>
                                <th className="px-6 py-4">Vendeur</th>
                                <th className="px-6 py-4">Prix</th>
                                <th className="px-6 py-4">Statut / Boost</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-transparent">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-white/5 shrink-0" />
                                                <div className="space-y-2">
                                                    <div className="h-4 w-32 bg-white/10 rounded" />
                                                    <div className="h-3 w-20 bg-white/5 rounded" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-white/5 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-white/10 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-5 w-16 bg-white/5 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="h-8 w-24 bg-white/5 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : products.map((product) => {
                                const isBoosted = product.boost_expires_at && new Date(product.boost_expires_at) > new Date()

                                return (
                                    <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-white/10 overflow-hidden shrink-0">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-neutral-800" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-white line-clamp-1 max-w-[200px]">{product.title}</div>
                                                    <div className="text-xs text-neutral-500">{product.category} • {product.city}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-white">{product.profiles?.display_name || "Inconnu"}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-emerald-400">
                                            {product.price} TND
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-start gap-1">
                                                <span className={`px-2 py-1 flex items-center gap-1.5 text-[10px] uppercase font-bold rounded-full ${product.status === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                                                    }`}>
                                                    {product.status === "active" ? "Actif" : "Fermé"}
                                                </span>
                                                {isBoosted && (
                                                    <span className="px-2 py-1 text-[10px] uppercase font-bold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                                        Boosté ({product.boost_amount} TND)
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <a href={`/product/${product.id}`} target="_blank" rel="noreferrer" className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                                <button
                                                    onClick={() => toggleStatus(product.id, product.status)}
                                                    className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                    title={product.status === "active" ? "Désactiver" : "Activer"}
                                                >
                                                    <Eye className={`w-4 h-4 ${product.status === 'active' ? 'opacity-100' : 'opacity-30'}`} />
                                                </button>
                                                <button
                                                    onClick={() => deleteProduct(product.id)}
                                                    disabled={deleting === product.id}
                                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    {deleting === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}

                            {products.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-neutral-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="w-8 h-8 opacity-20" />
                                            <p>Aucune annonce trouvée.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-white/[0.01]">
                        <div className="text-sm text-neutral-500">
                            Page <span className="text-white font-medium">{page}</span> sur <span className="text-white font-medium">{totalPages}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 text-white bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 text-white bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
