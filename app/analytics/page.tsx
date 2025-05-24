"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Clock,
  Target,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react"
import { MobileHeader } from "@/components/mobile-header"

// Mock data for charts
const interactionTrends = [
  { month: "Jan", interactions: 45, followUps: 12 },
  { month: "Feb", interactions: 52, followUps: 15 },
  { month: "Mar", interactions: 48, followUps: 11 },
  { month: "Apr", interactions: 61, followUps: 18 },
  { month: "May", interactions: 55, followUps: 14 },
  { month: "Jun", interactions: 67, followUps: 20 },
]

const programData = [
  { program: "Foundations", students: 8, interactions: 24, successRate: 87 },
  { program: "101", students: 6, interactions: 18, successRate: 92 },
  { program: "Lightspeed", students: 5, interactions: 15, successRate: 85 },
  { program: "Liftoff", students: 4, interactions: 12, successRate: 90 },
]

const staffPerformance = [
  { name: "Tahir Lee", interactions: 28, avgRating: 4.8, followUpRate: 95 },
  { name: "Barbara Cicalese", interactions: 25, avgRating: 4.9, followUpRate: 98 },
  { name: "Charles Mitchell", interactions: 22, avgRating: 4.7, followUpRate: 92 },
]

const interactionTypes = [
  { type: "Coaching", count: 32, percentage: 45, trend: "up" },
  { type: "Academic Support", count: 18, percentage: 25, trend: "up" },
  { type: "Career Counseling", count: 12, percentage: 17, trend: "stable" },
  { type: "Performance Improvement", count: 6, percentage: 8, trend: "down" },
  { type: "Behavioral Intervention", count: 4, percentage: 5, trend: "down" },
]

export default function AnalyticsPage() {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <MobileHeader />

      <main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Header Section */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">Insights and trends for student interactions</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select defaultValue="30days">
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="year">This year</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 sm:flex-none">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button className="flex-1 sm:flex-none">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-3 sm:p-6">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-2">
                    <div className="bg-blue-200 p-2 rounded-full">
                      <MessageSquare className="h-4 w-4 lg:h-6 lg:w-6 text-blue-700" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-blue-600">Total</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900">342</p>
                  <div className="flex items-center justify-center lg:justify-start mt-1 sm:mt-2">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-1" />
                    <span className="text-xs sm:text-sm text-green-600">+12%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-3 sm:p-6">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-2">
                    <div className="bg-green-200 p-2 rounded-full">
                      <Target className="h-4 w-4 lg:h-6 lg:w-6 text-green-700" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-green-600">Success</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900">89%</p>
                  <div className="flex items-center justify-center lg:justify-start mt-1 sm:mt-2">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-1" />
                    <span className="text-xs sm:text-sm text-green-600">+3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-3 sm:p-6">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-2">
                    <div className="bg-purple-200 p-2 rounded-full">
                      <Users className="h-4 w-4 lg:h-6 lg:w-6 text-purple-700" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-purple-600">Students</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-900">23</p>
                  <div className="flex items-center justify-center lg:justify-start mt-1 sm:mt-2">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-1" />
                    <span className="text-xs sm:text-sm text-green-600">+2 new</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-3 sm:p-6">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-2">
                    <div className="bg-orange-200 p-2 rounded-full">
                      <Clock className="h-4 w-4 lg:h-6 lg:w-6 text-orange-700" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-orange-600">Response</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-900">2.4h</p>
                  <div className="flex items-center justify-center lg:justify-start mt-1 sm:mt-2">
                    <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-1" />
                    <span className="text-xs sm:text-sm text-green-600">-0.3h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Interaction Trends */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span>Interaction Trends</span>
                </CardTitle>
                <CardDescription>Monthly interaction volume and follow-up rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {interactionTrends.map((data, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-8 sm:w-12 text-xs sm:text-sm font-medium text-gray-600">{data.month}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(data.interactions / 70) * 100}%`, minWidth: "20px" }}
                            ></div>
                            <span className="text-xs sm:text-sm text-gray-600">{data.interactions}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <div
                              className="bg-green-400 h-1 rounded-full"
                              style={{ width: `${(data.followUps / 25) * 100}%`, minWidth: "10px" }}
                            ></div>
                            <span className="text-xs text-gray-500">{data.followUps} follow-ups</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Interaction Types */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <PieChart className="h-5 w-5 text-purple-600" />
                  <span>Interaction Types</span>
                </CardTitle>
                <CardDescription>Distribution and trends by interaction category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {interactionTypes.map((type, index) => (
                    <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="flex items-center space-x-2">
                          {getTrendIcon(type.trend)}
                          <span className="font-medium text-gray-900 text-sm sm:text-base">{type.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{type.count}</div>
                          <div className="text-xs text-gray-500">{type.percentage}%</div>
                        </div>
                        <div
                          className="w-12 sm:w-16 bg-gray-200 rounded-full h-2"
                          style={{
                            background: `linear-gradient(to right, #3b82f6 ${type.percentage}%, #e5e7eb ${type.percentage}%)`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Program Performance */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Program Performance</CardTitle>
              <CardDescription>Success rates and engagement metrics by program</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {programData.map((program, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 rounded-xl border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{program.program}</h3>
                      <Badge variant="outline" className="bg-white text-xs">
                        {program.successRate}% success
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-gray-600">Students</span>
                        <span className="font-medium text-sm sm:text-base">{program.students}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-gray-600">Interactions</span>
                        <span className="font-medium text-sm sm:text-base">{program.interactions}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                          style={{ width: `${program.successRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Staff Performance */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Staff Performance</CardTitle>
              <CardDescription>Individual staff metrics and performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staffPerformance.map((staff, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg space-y-3 sm:space-y-0"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{staff.name}</h3>
                        <p className="text-sm text-gray-600">{staff.interactions} interactions this month</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-4 sm:space-x-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{staff.avgRating}</div>
                        <div className="text-xs text-gray-500">Avg Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{staff.followUpRate}%</div>
                        <div className="text-xs text-gray-500">Follow-up Rate</div>
                      </div>
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < Math.floor(staff.avgRating) ? "bg-yellow-400" : "bg-gray-200"
                            }`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-200 p-2 rounded-full">
                    <TrendingUp className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900 text-sm sm:text-base">Positive Trend</h3>
                    <p className="text-xs sm:text-sm text-green-700">Student engagement up 15% this quarter</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-200 p-2 rounded-full">
                    <Target className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 text-sm sm:text-base">Goal Achievement</h3>
                    <p className="text-xs sm:text-sm text-blue-700">89% of students meeting milestones</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-200 p-2 rounded-full">
                    <Calendar className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-900 text-sm sm:text-base">Upcoming Milestone</h3>
                    <p className="text-xs sm:text-sm text-purple-700">Q4 review scheduled for next week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
