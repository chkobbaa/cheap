"use client"

import Link from "next/link"
import Image from "next/image"
import { Zap } from "lucide-react"
import ElectricBorder from "./ElectricBorder"

interface ProductCardProps {
  id: string
  title: string
  price: number
  marketPrice: number
  image: string
  location: string
  postedMinutesAgo: number
  isBoosted?: boolean
  isTopBoosted?: boolean
}

export function ProductCard({
  id,
  title,
  price,
  marketPrice,
  image,
  location,
  postedMinutesAgo,
  isBoosted = false,
  isTopBoosted = false,
}: ProductCardProps) {
  const discount = Math.round(((marketPrice - price) / marketPrice) * 100)

  const cardContent = (
    <Link href={`/product/${id}`} className="block h-full">
      <div className={`rounded-2xl transition-all ${isBoosted ? "bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 p-[1px] shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-1" : ""
        }`}>
        <div className={`group relative h-full w-full overflow-hidden rounded-2xl border transition-all ${isBoosted ? "border-transparent bg-neutral-950 hover:bg-neutral-900" : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04] hover:shadow-lg hover:shadow-black/20"
          }`}>
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-neutral-900">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />

            {/* Discount Badge */}
            {discount > 0 && (
              <div className="absolute left-2.5 top-2.5 rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-lg">
                -{discount}%
              </div>
            )}

            {/* Time badge */}
            <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
              {isBoosted && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-lg backdrop-blur-sm ring-1 ring-white/20" title="Annonce Sponsorisée">
                  <Zap className="h-3 w-3 fill-current drop-shadow-md" />
                </span>
              )}
              {!isBoosted && (
                <div className="rounded-full bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white/80">
                  {postedMinutesAgo}m
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="p-3 sm:p-4">
            <h3 className="text-sm font-medium text-white line-clamp-1 mb-1.5">
              {title}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-emerald-400 sm:text-lg">
                {price} TND
              </span>
              {marketPrice && marketPrice > price && (
                <span className="text-xs text-neutral-500 line-through">
                  {marketPrice}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-neutral-500">{location}</p>
          </div>
        </div>
      </div>
    </Link>
  )

  if (isTopBoosted) {
    return (
      <ElectricBorder color="#7df9ff" speed={1} chaos={0.12} borderRadius={16} className="h-full">
        {cardContent}
      </ElectricBorder>
    )
  }

  return cardContent
}
