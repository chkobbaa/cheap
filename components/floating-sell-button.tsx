"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function FloatingSellButton() {
  const { t } = useLanguage()

  return (
    <Link
      href="/sell"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-success px-6 py-4 font-semibold text-success-foreground shadow-lg transition-all hover:bg-success/90 hover:shadow-xl md:hidden"
      aria-label={t("nav.sell")}
    >
      <Plus className="h-5 w-5" />
      <span>{t("nav.sell")}</span>
    </Link>
  )
}
