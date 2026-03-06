"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { SparklesCore } from "@/components/sparkles"
import { Zap, TrendingUp, Eye, Clock, ShieldCheck } from "lucide-react"

interface BoostCalculatorProps {
    onBoost: (amount: number, days: number) => void
    isProcessing?: boolean
}

export function BoostCalculator({ onBoost, isProcessing = false }: BoostCalculatorProps) {
    const [amount, setAmount] = useState(10)

    // Formulas for visualization
    const days = Math.floor(amount / 2) + 1 // e.g. 2 TND = 2 days, 10 TND = 6 days, 50 TND = 26 days
    const viewsIncrease = Math.floor(amount * 35) // Fake multiplier for visualization
    const rankEstimate = Math.max(1, 50 - Math.floor(amount * 1.5)) // Rank improvement

    return (
        <div className="w-full max-w-xl mx-auto rounded-3xl border border-white/10 bg-neutral-950 p-6 md:p-8 shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-cyan-500/10 blur-[100px] pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                        <Zap className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Booster l'annonce</h2>
                </div>
                <p className="text-neutral-400 mb-8 text-sm">Investissez pour apparaître en haut des résultats de recherche.</p>

                {/* Amount Slider */}
                <div className="mb-10">
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-sm font-medium text-neutral-300">Budget de boost</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-white">{amount}</span>
                            <span className="text-neutral-500 font-medium">TND</span>
                        </div>
                    </div>

                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <div className="flex justify-between mt-2 text-xs text-neutral-500 font-medium tracking-wider">
                        <span>1 TND</span>
                        <span>100 TND</span>
                    </div>
                </div>

                {/* Real-time Visualization Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <motion.div
                        key={viewsIncrease}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/[0.03] border border-white/5"
                    >
                        <Eye className="w-5 h-5 text-emerald-400 mb-2" />
                        <span className="text-2xl font-bold text-white">+{viewsIncrease}%</span>
                        <span className="text-xs text-neutral-500 uppercase tracking-wider mt-1">Vues estimées</span>
                    </motion.div>

                    <motion.div
                        key={rankEstimate}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/[0.03] border border-white/5"
                    >
                        <TrendingUp className="w-5 h-5 text-blue-400 mb-2" />
                        <span className="text-2xl font-bold text-white">Top {rankEstimate}</span>
                        <span className="text-xs text-neutral-500 uppercase tracking-wider mt-1">Position Rech.</span>
                    </motion.div>

                    <motion.div
                        key={days}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/[0.03] border border-white/5"
                    >
                        <Clock className="w-5 h-5 text-purple-400 mb-2" />
                        <span className="text-2xl font-bold text-white">{days}</span>
                        <span className="text-xs text-neutral-500 uppercase tracking-wider mt-1">Jours de Boost</span>
                    </motion.div>
                </div>

                {/* Competitor Comparison Bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-xs text-neutral-400 mb-2">
                        <span>Score Visibilité Vis-à-vis Concurrence</span>
                        <span>{Math.min(100, Math.floor((amount / 50) * 100))}%</span>
                    </div>
                    <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden flex">
                        <motion.div
                            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (amount / 50) * 100)}%` }}
                            transition={{ type: "spring", stiffness: 100 }}
                        />
                    </div>
                    <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Paiement sécurisé et garanti 100%
                    </p>
                </div>

                {/* Action Button */}
                <button
                    onClick={() => onBoost(amount, days)}
                    disabled={isProcessing}
                    className="relative w-full py-4 rounded-2xl font-bold text-lg text-white group overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {/* Button Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 group-hover:from-cyan-500 group-hover:to-blue-500 transition-colors" />

                    {/* Sparkles effect behind text */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <SparklesCore
                            id="button-sparkles"
                            background="transparent"
                            minSize={0.4}
                            maxSize={1}
                            particleDensity={50}
                            className="w-full h-full"
                            particleColor="#FFFFFF"
                        />
                    </div>

                    <div className="relative z-10 flex items-center justify-center gap-2">
                        {isProcessing ? "Traitement..." : `Payer ${amount} TND via Konnect`}
                        {!isProcessing && <Zap className="w-5 h-5 fill-current" />}
                    </div>
                </button>
            </div>
        </div>
    )
}
