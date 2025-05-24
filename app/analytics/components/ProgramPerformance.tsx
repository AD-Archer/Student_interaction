/**
 * ProgramPerformance.tsx
 * This component renders the program performance grid for the analytics dashboard. It is specific to the /analytics page.
 * Expects an array of program data objects as a prop.
 * Future devs: keep this component focused on rendering, not data fetching.
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export type ProgramData = {
  program: string
  students: number
  interactions: number
  successRate: number
}

// I keep this component focused on rendering the program performance grid
export const ProgramPerformance = ({ data }: { data: ProgramData[] }) => (
  <Card className="shadow-lg">
    <CardHeader>
      <CardTitle className="text-lg sm:text-xl">Program Performance</CardTitle>
      <CardDescription>Success rates and engagement metrics by program</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {data.map((program, index) => (
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
)
