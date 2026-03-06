"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, User, LayoutDashboard, Package, Settings, LogOut } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function Navbar() {
  const { language, setLanguage, t } = useLanguage()
  const { user, profile, loading, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-foreground">cheap</span>
          <span className="text-xl font-bold text-success">.tn</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            {t("nav.buy")}
          </Link>
          <Link href="/sell" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            {t("nav.sell")}
          </Link>
          <Link href="/categories" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            {t("nav.categories")}
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex items-center rounded-full border border-border bg-secondary p-1">
            <button
              onClick={() => setLanguage("fr")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${language === "fr"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              FR
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${language === "en"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              EN
            </button>
          </div>

          {/* Sell Button (desktop) */}
          <Link href="/sell" className="hidden md:block">
            <Button className="bg-success text-success-foreground hover:bg-success/90">
              {t("nav.sell")}
            </Button>
          </Link>

          {/* Auth */}
          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex h-9 w-9 items-center justify-center rounded-full bg-success text-sm font-bold text-success-foreground transition-all hover:ring-2 hover:ring-success/30 hover:ring-offset-2 hover:ring-offset-background">
                      {profile?.display_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-foreground">
                        {profile?.display_name || user.email?.split("@")[0]}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        {t("nav.dashboard")}
                      </Link>
                    </DropdownMenuItem>
                    {profile?.role === "seller" && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/listings" className="cursor-pointer gap-2">
                          <Package className="h-4 w-4" />
                          {t("nav.myListings")}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="cursor-pointer gap-2">
                        <Settings className="h-4 w-4" />
                        {t("nav.settings")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      {t("nav.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth/login">
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("nav.login")}</span>
                  </Button>
                </Link>
              )}
            </>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="space-y-1 px-4 py-4">
            <Link
              href="/"
              className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("nav.buy")}
            </Link>
            <Link
              href="/sell"
              className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("nav.sell")}
            </Link>
            <Link
              href="/categories"
              className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("nav.categories")}
            </Link>
            {user && (
              <>
                <div className="my-2 border-t border-border" />
                <Link
                  href="/dashboard"
                  className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("nav.dashboard")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
