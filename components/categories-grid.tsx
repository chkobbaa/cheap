"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { Smartphone, Laptop, Gamepad2, Refrigerator, Car, Package } from "lucide-react"

const categories = [
  { key: "phones", icon: Smartphone, slug: "phones" },
  { key: "computers", icon: Laptop, slug: "computers" },
  { key: "gaming", icon: Gamepad2, slug: "gaming" },
  { key: "appliances", icon: Refrigerator, slug: "appliances" },
  { key: "cars", icon: Car, slug: "cars" },
  { key: "misc", icon: Package, slug: "misc" },
]

export function CategoriesGrid() {
  const { t } = useLanguage()

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold text-foreground sm:text-3xl">
          {t("nav.categories")}
        </h2>

        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6 sm:gap-6">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Link
                key={category.key}
                href={`/categories/${category.slug}`}
                className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-success/50 hover:shadow-md sm:p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary transition-colors group-hover:bg-success/10 sm:h-16 sm:w-16">
                  <Icon className="h-6 w-6 text-foreground transition-colors group-hover:text-success sm:h-8 sm:w-8" />
                </div>
                <span className="text-center text-xs font-medium text-foreground sm:text-sm">
                  {t(`cat.${category.key}`)}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
