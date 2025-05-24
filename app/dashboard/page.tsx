import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, User, MessageSquare, AlertCircle } from "lucide-react"

const recentInteractions = [
  {
    id: 1,
    studentName: "Micheal Newman",
    studentId: "0001",
    type: "Coaching",
    reason: "Job interview preparation",
    date: "12/12/12",
    status: "completed",
    followUp: { required: true, date: "9/21/2029", overdue: true },
  },
  {
    id: 2,
    studentName: "Amira Johnson",
    studentId: "0002",
    type: "Academic Support",
    reason: "Course planning assistance",
    date: "12/12/12",
    status: "completed",
    followUp: { required: true, date: "9/22/2029", overdue: false },
  },
  {
    id: 3,
    studentName: "Koleona Smith",
    studentId: "0003",
    type: "Career Counseling",
    reason: "Industry exploration",
    date: "12/12/12",
    status: "completed",
    followUp: { required: false },
  },
  {
    id: 4,
    studentName: "Zaire Williams",
    studentId: "0004",
    type: "Behavioral",
    reason: "Attendance improvement",
    date: "12/12/12",
    status: "completed",
    followUp: { required: false },
  },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Interaction Dashboard</h1>
              <p className="text-sm text-gray-600">Micheal Newman - Interaction History</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Staff: Example Staff</span>
              <div className="text-xs text-gray-500">Date: {new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Student Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Micheal Newman</span>
                <Badge variant="secondary">Student ID: 0001</Badge>
              </CardTitle>
              <CardDescription>Foundations Program • Active Student</CardDescription>
            </CardHeader>
          </Card>

          {/* Recent Interactions */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Recent Interactions</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <MessageSquare className="h-4 w-4 mr-2" />
                Create New Interaction
              </Button>
            </div>

            <div className="grid gap-4">
              {recentInteractions.map((interaction) => (
                <Card key={interaction.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            {interaction.type}
                          </Badge>
                          <span className="text-sm text-gray-600">Date: {interaction.date}</span>
                        </div>
                        <h3 className="font-medium text-gray-900">{interaction.studentName}</h3>
                        <p className="text-sm text-gray-600">Reason: {interaction.reason}</p>
                      </div>

                      <div className="text-right space-y-2">
                        {interaction.followUp.required && (
                          <div className="flex items-center space-x-2">
                            {interaction.followUp.overdue ? (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <CalendarDays className="h-4 w-4 text-blue-500" />
                            )}
                            <span
                              className={`text-sm ${
                                interaction.followUp.overdue ? "text-red-600 font-medium" : "text-gray-600"
                              }`}
                            >
                              Follow up: {interaction.followUp.date}
                              {interaction.followUp.overdue && " - Overdue"}
                            </span>
                          </div>
                        )}
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* View All Button */}
          <div className="text-center">
            <Button variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
              View All Student Interactions
            </Button>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            Last edited: {new Date().toLocaleTimeString()} by Tahir Lee
          </div>
        </div>
      </footer>
    </div>
  )
}
