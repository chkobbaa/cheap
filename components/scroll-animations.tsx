"use client"

import { useRef, ReactNode } from "react"
import { motion, useScroll, useTransform } from "motion/react"

/** A section that animates INTO view on scroll — slides up with fade */
export function ScrollReveal({
    children,
    className,
}: {
    children: ReactNode
    className?: string
}) {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start 95%", "start 60%"],
    })

    const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
    const y = useTransform(scrollYProgress, [0, 1], [80, 0])
    const scale = useTransform(scrollYProgress, [0, 1], [0.96, 1])

    return (
        <motion.div
            ref={ref}
            style={{ opacity, y, scale }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

/** A section that slides in from the left */
export function ScrollSlideLeft({
    children,
    className,
}: {
    children: ReactNode
    className?: string
}) {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start 95%", "start 55%"],
    })

    const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
    const x = useTransform(scrollYProgress, [0, 1], [-100, 0])

    return (
        <motion.div
            ref={ref}
            style={{ opacity, x }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

/** A section that slides in from the right */
export function ScrollSlideRight({
    children,
    className,
}: {
    children: ReactNode
    className?: string
}) {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start 95%", "start 55%"],
    })

    const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
    const x = useTransform(scrollYProgress, [0, 1], [100, 0])

    return (
        <motion.div
            ref={ref}
            style={{ opacity, x }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

/** A section with 3D perspective tilt on scroll */
export function Scroll3D({
    children,
    className,
}: {
    children: ReactNode
    className?: string
}) {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start 95%", "start 40%"],
    })

    const rotateX = useTransform(scrollYProgress, [0, 1], [15, 0])
    const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1])
    const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
    const y = useTransform(scrollYProgress, [0, 1], [60, 0])

    return (
        <div ref={ref} className={`[perspective:1200px] ${className || ""}`}>
            <motion.div
                style={{ rotateX, scale, opacity, y }}
                className="transform-gpu"
            >
                {children}
            </motion.div>
        </div>
    )
}
