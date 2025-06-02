"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Users, Clock, AlertCircle } from "lucide-react"

interface StatsGridProps {
  totalInteractions: number
  pendingCount: number
  overdueCount: number
  loading: boolean
}

export function StatsGrid({ totalInteractions, pendingCount, overdueCount, loading }: StatsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="animate-pulse">
                <div className="bg-gray-300 h-8 w-8 rounded-full mb-2"></div>
                <div className="bg-gray-300 h-4 w-16 rounded mb-1"></div>
                <div className="bg-gray-300 h-8 w-12 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-2">
              <div className="bg-blue-200 p-2 rounded-full">
                <MessageSquare className="h-4 w-4 lg:h-5 lg:w-5 text-blue-700" />
              </div>
            </div>
            <p className="text-xs sm:text-sm font-medium text-blue-600">
              Total
            </p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900">
              {totalInteractions}
            </p>
            <p className="text-xs text-blue-600 mt-1 hidden sm:block">
              +2 from yesterday
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-2">
              <div className="bg-green-200 p-2 rounded-full">
                <Users className="h-4 w-4 lg:h-5 lg:w-5 text-green-700" />
              </div>
            </div>
            <p className="text-xs sm:text-sm font-medium text-green-600">
              Students
            </p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900">
              4
            </p>
            <p className="text-xs text-green-600 mt-1 hidden sm:block">
              All programs
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-2">
              <div className="bg-yellow-200 p-2 rounded-full">
                <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-700" />
              </div>
            </div>
            <p className="text-xs sm:text-sm font-medium text-yellow-600">
              Pending
            </p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-900">
              {pendingCount}
            </p>
            <p className="text-xs text-yellow-600 mt-1 hidden sm:block">
              Due this week
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-2">
              <div className="bg-red-200 p-2 rounded-full">
                <AlertCircle className="h-4 w-4 lg:h-5 lg:w-5 text-red-700" />
              </div>
            </div>
            <p className="text-xs sm:text-sm font-medium text-red-600">
              Overdue
            </p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-900">
              {overdueCount}
            </p>
            <p className="text-xs text-red-600 mt-1 hidden sm:block">
              Needs attention
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
