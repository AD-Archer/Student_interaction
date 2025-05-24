/**
 * InteractionTrends.tsx
 * This component renders the monthly interaction trends chart for the analytics dashboard. It is specific to the /analytics page.
 * Expects an array of trend data objects as a prop.
 * Future devs: keep this component focused on rendering, not data fetching.
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

export type InteractionTrend = {
  month: string
  interactions: number
  followUps: number
}

// I keep this component focused on rendering the trends chart
export const InteractionTrends = ({ data }: { data: InteractionTrend[] }) => (
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
        {data.map((d, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 sm:w-12 text-xs sm:text-sm font-medium text-gray-600">{d.month}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(d.interactions / 70) * 100}%`, minWidth: "20px" }}
                  ></div>
                  <span className="text-xs sm:text-sm text-gray-600">{d.interactions}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <div
                    className="bg-green-400 h-1 rounded-full"
                    style={{ width: `${(d.followUps / 25) * 100}%`, minWidth: "10px" }}
                  ></div>
                  <span className="text-xs text-gray-500">{d.followUps} follow-ups</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)
