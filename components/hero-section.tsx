"use client"

import { useEffect, useState } from "react"
import { SparklesCore } from "@/components/sparkles"

export function HeroSection() {
  const [showScroll, setShowScroll] = useState(true)

  useEffect(() => {
    const onScroll = () => {
      setShowScroll(window.scrollY < 100)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <section className="relative flex items-center justify-center bg-black overflow-hidden" style={{ height: "100vh" }}>
      <div className="relative z-20 text-center w-full">
        {/* Brand — single large word, Apple-style */}
        <h1 className="relative z-20 pb-4 text-6xl font-extrabold tracking-tight text-white sm:text-7xl lg:text-[8rem] leading-none select-none">
          <span className="text-white">cheap</span>
          <span className="text-emerald-400">.tn</span>
        </h1>

        {/* Aceternity Sparkles Container & Glowing Line */}
        <div className="relative mx-auto mt-2 h-64 w-[60rem] max-w-full">
          {/* Mobile Sparkles: Above the glowing line, behind text */}
          <div className="absolute bottom-full mb-[-1px] left-1/2 -translate-x-1/2 w-full h-32 md:hidden z-0 pointer-events-none">
            <SparklesCore
              id="tsparticles-mobile"
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={300} // Less dense for mobile
              className="w-full h-full"
              particleColor="#FFFFFF"
            />
            {/* Radial Gradient anchored at bottom center to fade edges and top */}
            <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(200px_150px_at_bottom_center,transparent_10%,white)]"></div>
          </div>
          {/* Gradients */}
          <div className="absolute inset-x-0 mx-auto top-0 h-[2px] w-3/4 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-sm" />
          <div className="absolute inset-x-0 mx-auto top-0 h-px w-3/4 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          <div className="absolute inset-x-0 mx-auto top-0 h-[5px] w-1/4 bg-gradient-to-r from-transparent via-emerald-400 to-transparent blur-sm" />
          <div className="absolute inset-x-0 mx-auto top-0 h-px w-1/4 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

          {/* Desktop Core component (Below the line) */}
          <div className="hidden md:block absolute inset-0">
            <SparklesCore
              id="tsparticles-desktop"
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={1200}
              className="w-full h-full"
              particleColor="#FFFFFF"
            />
            {/* Radial Gradient to prevent sharp edges */}
            <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(500px_300px_at_top,transparent_20%,white)]"></div>
          </div>
        </div>
      </div>

      {/* Scroll indicator — hides after scrolling */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 transition-opacity duration-500"
        style={{ opacity: showScroll ? 1 : 0, pointerEvents: showScroll ? "auto" : "none" }}
      >
        <div className="w-5 h-8 rounded-full border-2 border-white/20 flex items-start justify-center p-1">
          <div className="w-1 h-2 rounded-full bg-white/40 animate-bounce" />
        </div>
      </div>
    </section>
  )
}
