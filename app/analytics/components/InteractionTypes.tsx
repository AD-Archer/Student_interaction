/**
 * InteractionTypes.tsx
 * This component renders the interaction types distribution and trend chart for the analytics dashboard. It is specific to the /analytics page.
 * Expects an array of interaction type objects and a getTrendIcon function as props.
 * Future devs: keep this component focused on rendering, not data fetching or icon logic.
 */


import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { PieChart } from "lucide-react"

export type InteractionType = {
  type: string
  count: number
  percentage: number
  trend: string
}

// I keep this component focused on rendering the interaction types chart
export const InteractionTypes = ({
  types,
  getTrendIcon,
}: {
  types: InteractionType[]
  getTrendIcon: (trend: string) => React.ReactNode
}) => (
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
        {types.map((type, index) => (
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
)
