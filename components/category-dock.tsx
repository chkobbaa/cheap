"use client"

import { useRef, MouseEvent, ReactNode } from "react"
import Link from "next/link"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import { useLanguage } from "@/lib/language-context"
import { Smartphone, Laptop, Gamepad2, Refrigerator, Car, Package } from "lucide-react"

interface DockItemProps {
    href: string
    icon: ReactNode
    label: string
    mouseX: any
    index: number
}

function DockItem({ href, icon, label, mouseX, index }: DockItemProps) {
    const ref = useRef<HTMLDivElement>(null)

    const distance = useTransform(mouseX, (val: number) => {
        const el = ref.current
        if (!el || val === -1000) return 200
        const rect = el.getBoundingClientRect()
        const center = rect.left + rect.width / 2
        return Math.abs(val - center)
    })

    const size = useSpring(
        useTransform(distance, [0, 100, 200], [72, 56, 48]),
        { mass: 0.3, stiffness: 400, damping: 25 }
    )

    const iconSize = useSpring(
        useTransform(distance, [0, 100, 200], [32, 26, 22]),
        { mass: 0.3, stiffness: 400, damping: 25 }
    )

    return (
        <Link href={href}>
            <motion.div
                ref={ref}
                style={{ width: size, height: size }}
                className="relative flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm cursor-pointer group transition-colors hover:bg-white/10 hover:border-white/20"
            >
                <motion.div style={{ width: iconSize, height: iconSize }} className="flex items-center justify-center text-neutral-300 group-hover:text-white transition-colors">
                    {icon}
                </motion.div>

                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="rounded-lg bg-black/90 border border-white/10 px-3 py-1.5 text-xs font-medium text-white whitespace-nowrap shadow-lg">
                        {label}
                    </div>
                    <div className="mx-auto w-2 h-2 -mt-1 rotate-45 bg-black/90 border-r border-b border-white/10" />
                </div>

                {/* Reflection dot */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
        </Link>
    )
}

const categories = [
    { key: "phones", icon: <Smartphone className="w-full h-full" />, slug: "phones" },
    { key: "computers", icon: <Laptop className="w-full h-full" />, slug: "computers" },
    { key: "gaming", icon: <Gamepad2 className="w-full h-full" />, slug: "gaming" },
    { key: "appliances", icon: <Refrigerator className="w-full h-full" />, slug: "appliances" },
    { key: "cars", icon: <Car className="w-full h-full" />, slug: "cars" },
    { key: "misc", icon: <Package className="w-full h-full" />, slug: "misc" },
]

export function CategoryDock() {
    const { t } = useLanguage()
    const mouseX = useMotionValue(-1000)

    const handleMouseMove = (e: MouseEvent) => {
        mouseX.set(e.clientX)
    }

    const handleMouseLeave = () => {
        mouseX.set(-1000)
    }

    return (
        <section className="py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-sm font-medium tracking-widest text-neutral-500 uppercase mb-8">
                    {t("nav.categories")}
                </h2>

                {/* Dock */}
                <div
                    className="inline-flex items-end gap-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] px-4 py-3"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    {categories.map((category, index) => (
                        <DockItem
                            key={category.key}
                            href={`/categories/${category.slug}`}
                            icon={category.icon}
                            label={t(`cat.${category.key}`)}
                            mouseX={mouseX}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
