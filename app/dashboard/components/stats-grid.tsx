/**
 * StatsGrid Component
 * Modern, minimal dashboard stats grid. Uses clean glassmorphism, subtle gradients, and simple icons
 * for a calm, premium look that matches the HeroSection. All logic is unchanged; only the UI/UX is streamlined.
 */

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Users, Clock, AlertCircle } from "lucide-react"

interface StatsGridProps {
  totalInteractions: number
  pendingCount: number
  overdueCount: number
  loading: boolean
  studentCount?: number
}

export function StatsGrid({ totalInteractions, pendingCount, overdueCount, loading, studentCount }: StatsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white/70 border-0 rounded-2xl shadow animate-pulse">
            <CardContent className="p-5">
              <div className="flex flex-col items-center gap-2">
                <div className="bg-gray-200 h-10 w-10 rounded-xl mb-2" />
                <div className="bg-gray-200 h-4 w-16 rounded mb-1" />
                <div className="bg-gray-200 h-8 w-12 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const students = typeof studentCount === 'number' ? studentCount : 4

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Interactions */}
      <Card className="bg-white/70 border border-blue-100 rounded-2xl shadow-md">
        <CardContent className="p-6 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-blue-100 mb-2">
            <MessageSquare className="h-6 w-6 text-blue-500" />
          </div>
          <div className="text-xs font-semibold text-blue-700 tracking-wide uppercase">Total</div>
          <div className="text-2xl font-bold text-blue-900">{totalInteractions}</div>
        </CardContent>
      </Card>

      {/* Students */}
      <Card className="bg-white/70 border border-green-100 rounded-2xl shadow-md">
        <CardContent className="p-6 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-green-100 mb-2">
            <Users className="h-6 w-6 text-green-500" />
          </div>
          <div className="text-xs font-semibold text-green-700 tracking-wide uppercase">Students</div>
          <div className="text-2xl font-bold text-green-900">{students}</div>
        </CardContent>
      </Card>

      {/* Pending */}
      <Card className="bg-white/70 border border-yellow-100 rounded-2xl shadow-md">
        <CardContent className="p-6 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-yellow-100 mb-2">
            <Clock className="h-6 w-6 text-yellow-500" />
          </div>
          <div className="text-xs font-semibold text-yellow-700 tracking-wide uppercase">Pending</div>
          <div className="text-2xl font-bold text-yellow-900">{pendingCount}</div>
        </CardContent>
      </Card>

      {/* Overdue */}
      <Card className="bg-white/70 border border-pink-100 rounded-2xl shadow-md">
        <CardContent className="p-6 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-pink-100 mb-2">
            <AlertCircle className="h-6 w-6 text-pink-500" />
          </div>
          <div className="text-xs font-semibold text-pink-700 tracking-wide uppercase">Overdue</div>
          <div className="text-2xl font-bold text-pink-900">{overdueCount}</div>
        </CardContent>
      </Card>
    </div>
  )
}
