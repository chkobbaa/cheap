"use client"

import { use, useEffect, useState, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, Loader2 } from "lucide-react"
import Link from "next/link"

interface Message {
    id: string
    sender_id: string
    receiver_id: string
    content: string
    created_at: string
    read: boolean
}

interface Partner {
    display_name: string
    avatar_url: string | null
}

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: partnerId } = use(params)
    const { user } = useAuth()
    const { t } = useLanguage()
    const [messages, setMessages] = useState<Message[]>([])
    const [partner, setPartner] = useState<Partner | null>(null)
    const [newMessage, setNewMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const endRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    useEffect(() => {
        if (!user) return
        fetchConversation()
        markAsRead()

        // Real-time subscription
        const channel = supabase
            .channel("messages")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `sender_id=eq.${partnerId}`,
                },
                (payload: any) => {
                    if (payload.new.receiver_id === user.id) {
                        setMessages((prev) => [...prev, payload.new as Message])
                        // Mark as read immediately
                        supabase
                            .from("messages")
                            .update({ read: true })
                            .eq("id", payload.new.id)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user, partnerId])

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const fetchConversation = async () => {
        setLoading(true)

        // Fetch partner profile
        const { data: partnerData } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("id", partnerId)
            .single()

        setPartner(partnerData)

        // Fetch messages
        const { data: msgs } = await supabase
            .from("messages")
            .select("*")
            .or(
                `and(sender_id.eq.${user!.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user!.id})`
            )
            .order("created_at", { ascending: true })

        setMessages(msgs || [])
        setLoading(false)
    }

    const markAsRead = async () => {
        await supabase
            .from("messages")
            .update({ read: true })
            .eq("sender_id", partnerId)
            .eq("receiver_id", user!.id)
            .eq("read", false)
    }

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || sending) return

        setSending(true)
        const { data } = await supabase
            .from("messages")
            .insert({
                sender_id: user!.id,
                receiver_id: partnerId,
                content: newMessage.trim(),
            })
            .select()
            .single()

        if (data) {
            setMessages((prev) => [...prev, data])
        }
        setNewMessage("")
        setSending(false)
    }

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-6rem)]">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border pb-4 mb-4">
                <Link href="/dashboard/messages">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-bold">
                        {partner?.avatar_url ? (
                            <img src={partner.avatar_url} className="h-full w-full rounded-full object-cover" />
                        ) : (
                            partner?.display_name?.charAt(0)?.toUpperCase() || "?"
                        )}
                    </div>
                    <span className="font-semibold text-foreground">{partner?.display_name || t("dashboard.loading")}</span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 px-1">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-success" />
                    </div>
                ) : messages.length === 0 ? (
                    <p className="text-center text-muted-foreground py-10">{t("dashboard.startConversation")}</p>
                ) : (
                    messages.map((msg) => {
                        const isOwn = msg.sender_id === user!.id
                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isOwn
                                        ? "bg-success text-success-foreground rounded-br-md"
                                        : "bg-secondary text-foreground rounded-bl-md"
                                        }`}
                                >
                                    <p className="text-sm">{msg.content}</p>
                                    <p className={`text-[10px] mt-1 ${isOwn ? "text-success-foreground/70" : "text-muted-foreground"}`}>
                                        {formatTime(msg.created_at)}
                                    </p>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={endRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="flex gap-2 pt-4 border-t border-border mt-2">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t("dashboard.typeMessage")}
                    className="flex-1 h-12"
                    disabled={sending}
                />
                <Button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="h-12 px-6 bg-success text-success-foreground hover:bg-success/90"
                >
                    {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                </Button>
            </form>
        </div>
    )
}
