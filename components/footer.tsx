"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { Heart } from "lucide-react"

export function Footer() {
    const { t } = useLanguage()

    return (
        <footer className="border-t border-white/[0.06] bg-black">
            <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <Link href="/" className="inline-flex items-center gap-0.5 mb-4">
                            <span className="text-xl font-semibold text-white">cheap</span>
                            <span className="text-xl font-semibold text-emerald-400">.tn</span>
                        </Link>
                        <p className="text-sm text-neutral-500 max-w-xs leading-relaxed">
                            {t("footer.aboutDesc")}
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-sm font-medium text-white mb-4">{t("footer.links")}</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/" className="text-sm text-neutral-500 hover:text-white transition-colors">
                                    {t("nav.buy")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/sell" className="text-sm text-neutral-500 hover:text-white transition-colors">
                                    {t("nav.sell")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/categories" className="text-sm text-neutral-500 hover:text-white transition-colors">
                                    {t("nav.categories")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Help */}
                    <div>
                        <h3 className="text-sm font-medium text-white mb-4">{t("footer.help")}</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="#" className="text-sm text-neutral-500 hover:text-white transition-colors">
                                    {t("footer.terms")}
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-neutral-500 hover:text-white transition-colors">
                                    {t("footer.privacy")}
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-neutral-500 hover:text-white transition-colors">
                                    {t("footer.contact")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* About */}
                    <div>
                        <h3 className="text-sm font-medium text-white mb-4">{t("footer.about")}</h3>
                        <p className="text-sm text-neutral-500 leading-relaxed">
                            Le marché le plus rapide de Tunisie.
                        </p>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.06] pt-8">
                    <p className="text-xs text-neutral-600">
                        © {new Date().getFullYear()} cheap.tn. {t("footer.rights")}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-neutral-600">
                        Made with <Heart className="h-3 w-3 fill-pink-500 text-pink-500" /> in Tunisia 🇹🇳
                    </p>
                </div>
            </div>
        </footer>
    )
}
