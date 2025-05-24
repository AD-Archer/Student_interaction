/**
 * KeyMetrics.tsx
 * This component renders the four summary metric cards (Total, Success, Students, Response) for the analytics dashboard.
 * It is specific to the /analytics page and expects no props, as the values are currently static.
 * If future developers want to make these dynamic, they should pass the values as props.
 */

import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, TrendingUp, TrendingDown, Target, Users, Clock } from "lucide-react"

// I keep this component focused on the four key metrics at the top of the dashboard
export const KeyMetrics = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
    {/* Total Interactions */}
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

    {/* Success Rate */}
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

    {/* Students */}
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

    {/* Response Time */}
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
)
