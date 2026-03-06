"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

export interface Profile {
    id: string
    display_name: string
    avatar_url: string | null
    phone: string | null
    city: string | null
    role: "buyer" | "seller"
    rating: number
    items_sold: number
    verified: boolean
    created_at: string
    updated_at: string
}

interface AuthContextType {
    user: User | null
    session: Session | null
    profile: Profile | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error: any }>
    signUp: (email: string, password: string, metadata?: { display_name?: string; role?: string }) => Promise<{ error: any }>
    signInWithGoogle: () => Promise<{ error: any }>
    signOut: () => Promise<void>
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchProfile = async (userId: string) => {
        try {
            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single()

            if (data) {
                setProfile(data as Profile)
            }
        } catch {
            // Silently fail — profile may not exist yet
        }
    }

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id)
        }
    }

    useEffect(() => {
        // Use onAuthStateChange as the single source of truth
        // This avoids the "lock broken by steal" race condition
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event: any, session: Session | null) => {
                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    await fetchProfile(session.user.id)
                } else {
                    setProfile(null)
                }

                setLoading(false)
            }
        )

        // Fallback: if no auth event fires within 1s, stop loading
        const timeout = setTimeout(() => {
            setLoading(false)
        }, 1000)

        return () => {
            subscription.unsubscribe()
            clearTimeout(timeout)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error }
    }

    const signUp = async (
        email: string,
        password: string,
        metadata?: { display_name?: string; role?: string }
    ) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: metadata?.display_name || "",
                    full_name: metadata?.display_name || "",
                },
            },
        })

        if (!error && data.user) {
            await supabase
                .from("profiles")
                .update({
                    role: metadata?.role || "buyer",
                    display_name: metadata?.display_name || "",
                })
                .eq("id", data.user.id)
        }

        return { error }
    }

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
        return { error }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setSession(null)
        setProfile(null)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                profile,
                loading,
                signIn,
                signUp,
                signInWithGoogle,
                signOut,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
