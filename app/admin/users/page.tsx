"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Mail, Phone, MapPin, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Pagination & Filters
    const [page, setPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [searchTerm, setSearchTerm] = useState("")
    const [appliedSearch, setAppliedSearch] = useState("")
    const [roleFilter, setRoleFilter] = useState("all")

    const ITEMS_PER_PAGE = 20
    const supabase = createClient()

    useEffect(() => {
        const timer = setTimeout(() => {
            setAppliedSearch(searchTerm)
            setPage(1)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchTerm])

    useEffect(() => {
        fetchUsers()
    }, [page, appliedSearch, roleFilter])

    const fetchUsers = async () => {
        setLoading(true)

        try {
            let query = supabase
                .from("profiles")
                .select(`*`, { count: 'exact' })

            if (appliedSearch) {
                query = query.ilike("display_name", `%${appliedSearch}%`)
            }

            if (roleFilter !== "all") {
                query = query.eq("role", roleFilter)
            }

            const from = (page - 1) * ITEMS_PER_PAGE
            const to = from + ITEMS_PER_PAGE - 1

            const { data, count, error } = await query
                .order("created_at", { ascending: false })
                .range(from, to)

            if (!error && data) {
                setUsers(data)
                setTotalCount(count || 0)
            }
        } finally {
            setLoading(false)
        }
    }

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Base Utilisateurs {totalCount > 0 && <span className="text-neutral-500 text-base font-normal">({totalCount})</span>}</h1>
                    <p className="text-neutral-400">Gérez les utilisateurs inscrits sur la plateforme.</p>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500/50 w-full sm:w-64"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <select
                            value={roleFilter}
                            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                            className="bg-black border border-white/10 rounded-lg pl-9 pr-8 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 appearance-none w-full sm:w-auto"
                        >
                            <option value="all">Tous les rôles</option>
                            <option value="buyer">Acheteur</option>
                            <option value="seller">Vendeur</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.01] p-5 flex flex-col gap-3 animate-pulse h-36">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-white/5 shrink-0" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 w-24 bg-white/10 rounded" />
                                    <div className="h-3 w-16 bg-white/5 rounded-full" />
                                </div>
                            </div>
                            <div className="pt-3 border-t border-white/5 mt-auto space-y-2">
                                <div className="h-3 w-full bg-white/5 rounded" />
                            </div>
                        </div>
                    ))
                ) : users.map((u) => (
                    <div key={u.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-bold text-lg text-white shrink-0 overflow-hidden">
                                {u.avatar_url ? (
                                    <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    u.display_name?.charAt(0)?.toUpperCase() || "?"
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-semibold truncate">{u.display_name || "Sans Nom"}</h3>
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${u.role === "seller" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-neutral-800 text-neutral-400 border border-white/10"
                                    }`}>
                                    {u.role === 'seller' ? 'Vendeur' : 'Acheteur'}
                                </span>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-white/5 space-y-2 mt-auto">
                            <div className="flex items-center gap-2 text-sm text-neutral-400">
                                <Mail className="w-4 h-4 shrink-0 opacity-50" />
                                <span className="truncate">{u.id}</span> {/* Admin doesn't have access to auth.users email trivially without admin API, so we show ID or profile data */}
                            </div>
                            {u.phone && (
                                <div className="flex items-center gap-2 text-sm text-neutral-400">
                                    <Phone className="w-4 h-4 shrink-0 opacity-50" />
                                    <span>{u.phone}</span>
                                </div>
                            )}
                            {u.city && (
                                <div className="flex items-center gap-2 text-sm text-neutral-400">
                                    <MapPin className="w-4 h-4 shrink-0 opacity-50" />
                                    <span>{u.city}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {users.length === 0 && !loading && (
                    <div className="col-span-full py-16 text-center text-neutral-500 border border-white/5 border-dashed rounded-2xl flex flex-col items-center gap-2">
                        <Search className="w-8 h-8 opacity-20" />
                        <p>Aucun utilisateur trouvé.</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-8">
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
    )
}
