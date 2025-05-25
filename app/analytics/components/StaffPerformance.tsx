/**
 * StaffPerformance.tsx
 * This component renders the staff performance section for the analytics dashboard.
 * It is specific to the /analytics page. Expects an array of staff performance objects as a prop.
 * Future devs: keep this component focused on rendering, not data fetching.
 */



import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"
import { StaffPerformanceData } from "@/lib/data"

// I keep this component focused on rendering the staff performance section
export const StaffPerformance = ({ data }: { data: StaffPerformanceData[] }) => (
  <Card className="shadow-lg">
    <CardHeader>
      <CardTitle className="text-lg sm:text-xl">Staff Performance</CardTitle>
      <CardDescription>Individual staff metrics and performance indicators</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {data.map((staff, index) => (
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
)
