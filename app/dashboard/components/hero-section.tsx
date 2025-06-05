/**
 * HeroSection Component
 * Modern, minimal dashboard welcome header. Greets the user, shows overdue/pending stats,
 * and provides quick actions. Uses clean glassmorphism, subtle gradients, and simple icons
 * for a calm, premium look. All logic is unchanged; only the UI/UX is streamlined for clarity.
 */

"use client"

import { Button } from "@/components/ui/button"
import { Plus, BarChart3 } from "lucide-react"
import Link from "next/link"

interface HeroSectionProps {
  userName: string
  overdueCount: number
  pendingCount: number
  loading: boolean
}

export function HeroSection({ userName, overdueCount, pendingCount, loading }: HeroSectionProps) {
  return (
    <section className="relative rounded-2xl p-6 sm:p-8 lg:p-10 mt-4 bg-white/70 backdrop-blur-xl border border-blue-100 shadow-md flex flex-col gap-4">
      <div className="flex items-center gap-4 mb-2">
        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 shadow-sm">
          <BarChart3 className="h-7 w-7 text-blue-500" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Welcome back, <span className="text-blue-600">{userName}</span>
        </h1>
      </div>
      <div>
        {loading ? (
          <p className="text-gray-500 text-base sm:text-lg mt-1 font-medium">Loading interactions...</p>
        ) : (
          <div className="flex flex-wrap gap-3 items-center mt-1">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-50 text-pink-700 font-semibold text-sm">
              {overdueCount} overdue
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold text-sm">
              {pendingCount} pending
            </span>
          </div>
        )}
      </div>
      <div className="flex gap-2 mt-2">
        <Link href="/create" className="flex-1">
          <Button
            variant="secondary"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all duration-150"
          >
            <Plus className="h-5 w-5 mr-1 text-white" />
            New Interaction
          </Button>
        </Link>
        <Link href="/analytics" className="flex-1">
          <Button
            variant="secondary"
            className="w-full bg-white/80 hover:bg-blue-50 text-blue-700 font-semibold border border-blue-100 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all duration-150"
          >
            <BarChart3 className="h-5 w-5 mr-1 text-blue-600" />
            Analytics
          </Button>
        </Link>
      </div>
    </section>
  )
}
