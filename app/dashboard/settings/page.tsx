"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { User, Phone, MapPin, Save, Loader2, Check } from "lucide-react"
import { toast } from "sonner"

const cities = [
    "Tunis", "Sousse", "Sfax", "Nabeul", "Monastir", "Bizerte",
    "Gabès", "Kairouan", "Gafsa", "Kasserine",
]

export default function SettingsPage() {
    const { user, profile, refreshProfile } = useAuth()
    const { t } = useLanguage()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        display_name: profile?.display_name || "",
        phone: profile?.phone || "",
        city: profile?.city || "",
    })
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase
            .from("profiles")
            .update({
                display_name: formData.display_name,
                phone: formData.phone,
                city: formData.city,
                updated_at: new Date().toISOString(),
            })
            .eq("id", user!.id)

        if (error) {
            toast.error(t("dashboard.saveError"))
        } else {
            toast.success(t("dashboard.saveSuccess"))
            await refreshProfile()
        }

        setLoading(false)
    }

    return (
        <div className="space-y-8 pb-20 md:pb-0 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold text-foreground">{t("dashboard.settings")}</h1>
                <p className="text-muted-foreground">{t("dashboard.settingsDesc")}</p>
            </div>

            {/* Profile Card */}
            <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success text-2xl font-bold text-success-foreground">
                        {profile?.display_name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                        <h2 className="font-semibold text-foreground">{profile?.display_name || user?.email}</h2>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                        <div className="flex items-center gap-1 mt-1">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${profile?.role === "seller"
                                    ? "bg-success/10 text-success"
                                    : "bg-blue-500/10 text-blue-500"
                                }`}>
                                {profile?.role === "seller" ? t("dashboard.seller") : t("dashboard.buyer")}
                            </span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {t("dashboard.displayName")}
                        </Label>
                        <Input
                            id="name"
                            value={formData.display_name}
                            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                            placeholder="Ahmed Ben Ali"
                            className="h-12"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {t("dashboard.phone")}
                        </Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+216 XX XXX XXX"
                            className="h-12"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {t("dashboard.city")}
                        </Label>
                        <Select
                            value={formData.city}
                            onValueChange={(value) => setFormData({ ...formData, city: value })}
                        >
                            <SelectTrigger className="h-12">
                                <SelectValue placeholder={t("dashboard.selectCity")} />
                            </SelectTrigger>
                            <SelectContent>
                                {cities.map((city) => (
                                    <SelectItem key={city} value={city}>
                                        {city}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 gap-2 bg-success text-success-foreground hover:bg-success/90 font-semibold"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                {t("dashboard.saveChanges")}
                            </>
                        )}
                    </Button>
                </form>
            </div>

            {/* Account Info */}
            <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold text-foreground mb-4">{t("dashboard.accountInfo")}</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Email</span>
                        <span className="text-foreground">{user?.email}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("dashboard.role")}</span>
                        <span className="text-foreground capitalize">{profile?.role || "buyer"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("dashboard.memberSince")}</span>
                        <span className="text-foreground">
                            {profile?.created_at
                                ? new Date(profile.created_at).toLocaleDateString("fr-FR", {
                                    month: "long",
                                    year: "numeric",
                                })
                                : "-"}
                        </span>
                    </div>
                    {profile?.verified && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t("dashboard.status")}</span>
                            <span className="flex items-center gap-1 text-success">
                                <Check className="h-4 w-4" />
                                {t("profile.verified")}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
