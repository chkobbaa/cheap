"use client"

import { NavbarMenu } from "@/components/navbar-menu"
import { HeroSection } from "@/components/hero-section"
import { CategoryDock } from "@/components/category-dock"
import { LiveDeals } from "@/components/live-deals"
import { Footer } from "@/components/footer"
import { FloatingSellButton } from "@/components/floating-sell-button"
import { ScrollReveal, Scroll3D } from "@/components/scroll-animations"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { AdBanner } from "@/components/ad-banner"
import { Search, Zap, ShoppingBag, ArrowRight, Shield, Clock, Star } from "lucide-react"

export default function Home() {
  const { t } = useLanguage()

  return (
    <div className="bg-black text-white min-h-screen">
      <NavbarMenu />

      {/* Hero: only brand + sparkles, full viewport */}
      <HeroSection />

      {/* Tagline + Search — revealed on scroll */}
      <section className="bg-black py-24 sm:py-32">
        <ScrollReveal className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl mb-4 leading-tight">
            {t("hero.title")}
          </p>
          <p className="text-lg text-neutral-500 mb-10 max-w-xl mx-auto">
            {t("hero.subtitle")}
          </p>

          {/* Search */}
          <div className="relative mx-auto max-w-xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
            <Input
              type="search"
              placeholder={t("hero.search")}
              className="h-14 rounded-full border-white/10 bg-white/5 pl-12 pr-4 text-base text-white shadow-lg placeholder:text-neutral-600 focus-visible:ring-emerald-400/50 backdrop-blur-sm"
            />
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/#deals">
              <Button size="lg" className="w-full gap-2 bg-white text-black hover:bg-neutral-200 sm:w-auto font-semibold rounded-full px-8">
                <ShoppingBag className="h-4 w-4" />
                {t("hero.buy")}
              </Button>
            </Link>
            <Link href="/sell">
              <Button size="lg" variant="outline" className="w-full gap-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-white sm:w-auto font-semibold rounded-full px-8">
                <Zap className="h-4 w-4" />
                {t("hero.sell")}
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* Categories Dock — macOS style */}
      <section className="bg-black">
        <ScrollReveal>
          <CategoryDock />
        </ScrollReveal>
      </section>

      {/* 3D Feature Cards */}
      <section className="bg-black py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal className="text-center mb-16">
            <p className="text-sm font-medium tracking-widest text-neutral-500 uppercase mb-3">
              Pourquoi cheap.tn
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Simple. Rapide. Fiable.
            </h2>
          </ScrollReveal>

          <div className="grid gap-6 sm:grid-cols-3">
            <Scroll3D>
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 sm:p-10 text-center h-full">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
                  <Zap className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">30 secondes</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  Publiez votre annonce en quelques clics. Photo, prix, publié.
                </p>
              </div>
            </Scroll3D>

            <Scroll3D>
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 sm:p-10 text-center h-full">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10">
                  <Shield className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Sécurisé</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  Vendeurs vérifiés, notes et avis, messagerie intégrée.
                </p>
              </div>
            </Scroll3D>

            <Scroll3D>
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 sm:p-10 text-center h-full">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
                  <Star className="h-8 w-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Meilleur prix</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  Comparez avec le prix du marché. Économisez à chaque achat.
                </p>
              </div>
            </Scroll3D>
          </div>
        </div>
      </section>

      {/* Stats — 3D scroll in */}
      <section className="bg-black py-16">
        <Scroll3D className="mx-auto max-w-4xl px-6">
          <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-10 sm:p-14">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-4xl font-bold text-white sm:text-5xl">10K+</p>
                <p className="mt-2 text-sm text-neutral-500">Utilisateurs</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-emerald-400 sm:text-5xl">50K+</p>
                <p className="mt-2 text-sm text-neutral-500">Annonces</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-white sm:text-5xl">30s</p>
                <p className="mt-2 text-sm text-neutral-500">Pour publier</p>
              </div>
            </div>
          </div>
        </Scroll3D>
      </section>

      {/* Advertisement slot */}
      <section className="bg-black py-8">
        <ScrollReveal className="px-4">
          <AdBanner format="horizontal" className="my-4" />
        </ScrollReveal>
      </section>

      {/* Live Deals */}
      <section className="bg-neutral-950 py-4">
        <ScrollReveal>
          <LiveDeals />
        </ScrollReveal>
      </section>

      {/* CTA Banner */}
      <section className="bg-black py-24">
        <ScrollReveal className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
            Prêt à vendre ?
          </h2>
          <p className="text-neutral-500 mb-8 max-w-lg mx-auto">
            Rejoignez des milliers de vendeurs tunisiens. Créez votre première annonce gratuitement.
          </p>
          <Link href="/sell">
            <Button size="lg" className="gap-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-full px-10 font-semibold">
              Commencer maintenant
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </ScrollReveal>
      </section>

      <Footer />
      <FloatingSellButton />
    </div>
  )
}
