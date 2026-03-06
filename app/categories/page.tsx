"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { createClient } from "@/lib/supabase/client"
import { NavbarMenu as Navbar } from "@/components/navbar-menu"
import { Footer } from "@/components/footer"
import { FloatingSellButton } from "@/components/floating-sell-button"
import { Smartphone, Laptop, Gamepad2, Refrigerator, Car, Package } from "lucide-react"

const categoryConfig = [
  { key: "phones", icon: Smartphone, slug: "phones" },
  { key: "computers", icon: Laptop, slug: "computers" },
  { key: "gaming", icon: Gamepad2, slug: "gaming" },
  { key: "appliances", icon: Refrigerator, slug: "appliances" },
  { key: "cars", icon: Car, slug: "cars" },
  { key: "misc", icon: Package, slug: "misc" },
]

const fallbackCounts: Record<string, number> = {
  phones: 234, computers: 156, gaming: 189,
  appliances: 98, cars: 67, misc: 312,
}

export default function CategoriesPage() {
  const { t } = useLanguage()
  const [counts, setCounts] = useState<Record<string, number>>(fallbackCounts)
  const supabase = createClient()

  useEffect(() => {
    const fetchCounts = async () => {
      const newCounts: Record<string, number> = {}
      for (const cat of categoryConfig) {
        const { count } = await supabase
          .from("listings")
          .select("*", { count: "exact", head: true })
          .eq("category", cat.slug)
          .eq("status", "active")

        newCounts[cat.slug] = count || 0
      }
      // Only update if we got real data
      const total = Object.values(newCounts).reduce((a, b) => a + b, 0)
      if (total > 0) {
        setCounts(newCounts)
      }
    }
    fetchCounts()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-foreground sm:text-4xl">
          {t("nav.categories")}
        </h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoryConfig.map((category) => {
            const Icon = category.icon
            return (
              <Link
                key={category.key}
                href={`/categories/${category.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-6 transition-all hover:border-success/50 hover:shadow-lg"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-secondary transition-colors group-hover:bg-success/10">
                  <Icon className="h-8 w-8 text-foreground transition-colors group-hover:text-success" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {t(`cat.${category.key}`)}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {counts[category.slug] || 0} articles
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </main>

      <Footer />
      <FloatingSellButton />
    </div>
  )
}
