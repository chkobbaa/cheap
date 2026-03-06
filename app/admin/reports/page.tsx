"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, Check, Trash2, ExternalLink, Loader2, Flag } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function AdminReportsPage() {
    const supabase = createClient()
    const [reports, setReports] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchReports()
    }, [])

    const fetchReports = async () => {
        setLoading(true)

        // Fetch reports with joined data
        const { data, error } = await supabase
            .from("reports")
            .select(`
                id,
                reason,
                status,
                created_at,
                listings:listing_id (id, title, status, seller_id),
                profiles:reporter_id (id, display_name, email)
            `)
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Error fetching reports:", error)
        } else {
            setReports(data || [])
        }
        setLoading(false)
    }

    const updateReportStatus = async (reportId: string, newStatus: string) => {
        const { error } = await supabase
            .from("reports")
            .update({ status: newStatus })
            .eq("id", reportId)

        if (error) {
            toast.error("Erreur lors de la mise à jour.")
        } else {
            toast.success("Statut mis à jour.")
            fetchReports()
        }
    }

    const deleteListing = async (listingId: string, reportId: string) => {
        if (!confirm("Attention : Voulez-vous vraiment supprimer cette annonce ?")) return

        const { error: listingError } = await supabase
            .from("listings")
            .delete()
            .eq("id", listingId)

        if (listingError) {
            toast.error("Erreur lors de la suppression de l'annonce.")
            return
        }

        // Auto-dismiss the report since listing is gone
        await updateReportStatus(reportId, 'reviewed')
        toast.success("Annonce supprimée avec succès.")
    }

    if (loading) {
        return (
            <div className="p-8">
                <div className="flex items-center gap-3 mb-8">
                    <Flag className="w-8 h-8 text-red-500" />
                    <div>
                        <h1 className="text-3xl font-bold">Signalements</h1>
                        <p className="text-neutral-500 mt-1">Modération du contenu utilisateur</p>
                    </div>
                </div>
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                </div>
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
                <Flag className="w-8 h-8 text-red-500" />
                <div>
                    <h1 className="text-3xl font-bold">Signalements</h1>
                    <p className="text-neutral-500 mt-1">Modération du contenu utilisateur</p>
                </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5 border-b border-white/10">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-neutral-400 font-medium">Annonce Signalée</TableHead>
                            <TableHead className="text-neutral-400 font-medium">Signalé Par</TableHead>
                            <TableHead className="text-neutral-400 font-medium">Raison</TableHead>
                            <TableHead className="text-neutral-400 font-medium">Statut</TableHead>
                            <TableHead className="text-right text-neutral-400 font-medium">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-neutral-500">
                                    Aucun signalement trouvé.
                                </TableCell>
                            </TableRow>
                        ) : (
                            reports.map((report) => (
                                <TableRow key={report.id} className="border-white/5 hover:bg-white/[0.02]">
                                    <TableCell>
                                        {report.listings ? (
                                            <div className="font-medium">
                                                {report.listings.title}
                                                <Badge variant="outline" className="ml-2 bg-white/5">{report.listings.status}</Badge>
                                                <br />
                                                <Link href={`/product/${report.listings.id}`} target="_blank" className="text-xs text-cyan-500 hover:underline flex items-center gap-1 mt-1">
                                                    Voir l'annonce <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            </div>
                                        ) : (
                                            <span className="text-neutral-500 line-through">Annonce supprimée</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {report.profiles?.display_name || "Utilisateur supprimé"}
                                            <div className="text-xs text-neutral-500">{report.profiles?.email}</div>
                                            <div className="text-xs text-neutral-600 mt-1">
                                                {new Date(report.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-[200px] truncate text-sm" title={report.reason}>
                                            {report.reason}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {report.status === 'pending' && <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">En attente</Badge>}
                                        {report.status === 'reviewed' && <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Traité</Badge>}
                                        {report.status === 'dismissed' && <Badge className="bg-neutral-500/20 text-neutral-400 border-neutral-500/30">Ignoré</Badge>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {report.status === 'pending' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => updateReportStatus(report.id, 'dismissed')}
                                                        className="h-8 border-white/10 hover:bg-white/10"
                                                        title="Ignorer le signalement"
                                                    >
                                                        <Check className="w-4 h-4 text-emerald-400" />
                                                    </Button>
                                                    {report.listings && (
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => deleteListing(report.listings.id, report.id)}
                                                            className="h-8"
                                                            title="Supprimer l'annonce"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
