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
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 sm:p-6 lg:p-8 text-white mt-4">
      <div className="space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
            Welcome back, {userName}!
          </h1>
          {loading ? (
            <p className="text-blue-100 text-sm sm:text-base lg:text-lg mt-2">
              Loading interactions...
            </p>
          ) : (
            <p className="text-blue-100 text-sm sm:text-base lg:text-lg mt-2">
              You have {overdueCount} overdue follow-ups and {pendingCount} pending tasks.
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/create" className="flex-1">
            <Button
              variant="secondary"
              className="w-full bg-white text-blue-600 hover:bg-gray-100"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Interaction
            </Button>
          </Link>
          <Link href="/analytics" className="flex-1">
            <Button
              variant="secondary"
              className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
