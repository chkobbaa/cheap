"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import { createClient } from "@/lib/supabase/client"
import { MessageCircle, Loader2 } from "lucide-react"

interface ConversationThread {
    partnerId: string
    partnerName: string
    partnerAvatar: string | null
    lastMessage: string
    lastMessageAt: string
    unreadCount: number
    listingTitle: string | null
}

export default function MessagesPage() {
    const { user } = useAuth()
    const { t } = useLanguage()
    const [threads, setThreads] = useState<ConversationThread[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        if (!user) return
        fetchThreads()
    }, [user])

    const fetchThreads = async () => {
        setLoading(true)

        // Fetch all messages involving this user
        const { data: messages } = await supabase
            .from("messages")
            .select("*, sender:profiles!sender_id(display_name, avatar_url), receiver:profiles!receiver_id(display_name, avatar_url), listings(title)")
            .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
            .order("created_at", { ascending: false })

        if (!messages) {
            setLoading(false)
            return
        }

        // Group by conversation partner
        const threadMap = new Map<string, ConversationThread>()

        for (const msg of messages) {
            const partnerId = msg.sender_id === user!.id ? msg.receiver_id : msg.sender_id
            const partner = msg.sender_id === user!.id ? msg.receiver : msg.sender

            if (!threadMap.has(partnerId)) {
                const unreadCount = messages.filter(
                    (m: any) => m.sender_id === partnerId && m.receiver_id === user!.id && !m.read
                ).length

                threadMap.set(partnerId, {
                    partnerId,
                    partnerName: (partner as any)?.display_name || "Utilisateur",
                    partnerAvatar: (partner as any)?.avatar_url || null,
                    lastMessage: msg.content,
                    lastMessageAt: msg.created_at,
                    unreadCount,
                    listingTitle: (msg.listings as any)?.title || null,
                })
            }
        }

        setThreads(Array.from(threadMap.values()))
        setLoading(false)
    }

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 60) return `${mins}m`
        const hours = Math.floor(mins / 60)
        if (hours < 24) return `${hours}h`
        const days = Math.floor(hours / 24)
        return `${days}j`
    }

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            <div>
                <h1 className="text-2xl font-bold text-foreground">{t("dashboard.messages")}</h1>
                <p className="text-muted-foreground">{t("dashboard.messagesDesc")}</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-success" />
                </div>
            ) : threads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-border">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">{t("dashboard.noMessages")}</h3>
                    <p className="text-muted-foreground">{t("dashboard.noMessagesDesc")}</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {threads.map((thread) => (
                        <Link key={thread.partnerId} href={`/dashboard/messages/${thread.partnerId}`}>
                            <div className={`flex items-center gap-4 rounded-xl border p-4 transition-all hover:shadow-md cursor-pointer ${thread.unreadCount > 0
                                    ? "border-success/30 bg-success/5"
                                    : "border-border bg-card"
                                }`}>
                                {/* Avatar */}
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-lg font-bold text-foreground">
                                    {thread.partnerAvatar ? (
                                        <img src={thread.partnerAvatar} alt="" className="h-full w-full rounded-full object-cover" />
                                    ) : (
                                        thread.partnerName.charAt(0).toUpperCase()
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-foreground">{thread.partnerName}</span>
                                        <span className="text-xs text-muted-foreground">{timeAgo(thread.lastMessageAt)}</span>
                                    </div>
                                    {thread.listingTitle && (
                                        <p className="text-xs text-success line-clamp-1">{thread.listingTitle}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground line-clamp-1">{thread.lastMessage}</p>
                                </div>

                                {/* Unread badge */}
                                {thread.unreadCount > 0 && (
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-xs font-bold text-success-foreground">
                                        {thread.unreadCount}
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
