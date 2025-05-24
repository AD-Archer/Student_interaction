/**
 * QuickInsights.tsx
 * This component renders the three quick insight cards at the bottom of the analytics dashboard. It is specific to the /analytics page.
 * Expects no props, as the values are currently static. If future developers want to make these dynamic, they should pass the values as props.
 */


import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Target, Calendar } from "lucide-react"

// I keep this component focused on the three quick insight cards
export const QuickInsights = () => (
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
)
