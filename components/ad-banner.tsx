"use client"

import { useState } from "react"
import { AlertCircle, ExternalLink } from "lucide-react"

interface AdBannerProps {
    className?: string
    format?: "horizontal" | "square" | "tall"
}

export function AdBanner({ className = "", format = "horizontal" }: AdBannerProps) {
    const [isRendered, setIsRendered] = useState(true)

    if (!isRendered) return null

    // Dimension classes based on format
    const formatClasses = {
        horizontal: "w-full min-h-[100px] md:min-h-[120px] max-w-5xl mx-auto",
        square: "w-full aspect-square max-w-[300px] mx-auto",
        tall: "w-full min-h-[400px] max-w-[300px] mx-auto",
    }

    return (
        <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col items-center justify-center p-4 group ${formatClasses[format]} ${className}`}>
            {/* Label */}
            <span className="absolute top-2 right-3 text-[10px] font-bold text-neutral-600 uppercase tracking-widest bg-black/50 px-2 py-0.5 rounded-sm">
                Sponsorisé
            </span>

            {/* Placeholder content - To be replaced with real Google AdSense / Network Script */}
            <div className="flex flex-col items-center justify-center text-center space-y-3 opacity-40 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-1">
                    <AlertCircle className="w-5 h-5 text-neutral-400" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-neutral-300">Espace Publicitaire</h4>
                    <p className="text-xs text-neutral-500 mt-1 max-w-[200px]">Votre publicité ici. Touchez des milliers d'acheteurs tunisiens.</p>
                </div>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 mt-2 bg-cyan-500/10 px-3 py-1.5 rounded-full hover:bg-cyan-500/20 transition-colors">
                    <ExternalLink className="w-3 h-3" />
                    Nous contacter
                </button>
            </div>

            {/* 
        TODO: Add Google AdSense below
        <ins className="adsbygoogle"
             style={{ display: "block" }}
             data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
             data-ad-slot="XXXXXXXXXX"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>
             (adsbygoogle = window.adsbygoogle || []).push({});
        </script>
      */}
        </div>
    )
}
