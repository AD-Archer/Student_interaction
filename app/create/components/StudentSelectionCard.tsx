/**
 * StudentSelectionCard component handles student and interaction type selection.
 * This is the first section of the form where users select a student from the dropdown
 * and choose the type of interaction they had with that student.
 * 
 * Updates:
 * - Added console logging for debugging student email selection
 * - Improved handling of student email to ensure it's properly set
 */

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User } from "lucide-react"
import { FormData, formInteractionTypes as interactionTypes, formStudents as students } from "@/lib/data"

interface StudentSelectionCardProps {
  formData: FormData
  onFormDataChange: (updates: Partial<FormData>) => void
}

export function StudentSelectionCard({ formData, onFormDataChange }: StudentSelectionCardProps) {
  const handleStudentChange = (studentId: string) => {
    const student = students.find((s) => s.id === studentId)
    if (student) {
      // Log for debugging email issues
      console.log(`Selected student: ${student.firstName} ${student.lastName}, Email: ${student.email || 'No email available'}`)
      
      onFormDataChange({
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        studentEmail: student.email ?? ""
      })
    }
  }

  const handleInteractionTypeChange = (value: string) => {
    onFormDataChange({ interactionType: value })
  }

  return (
    <Card className="shadow-md border-blue-100 bg-white/80">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">Student Information</CardTitle>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Required
        </Badge>
      </CardHeader>
      <hr className="my-2 border-gray-200" />
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="student">Select Student</Label>
          <Select value={formData.studentId} onValueChange={handleStudentChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  <div className="flex items-center space-x-2 w-full">
                    <User className="h-4 w-4" />
                    <span className="flex-1">{`${student.firstName} ${student.lastName}`}</span>
                    <Badge variant="secondary" className="text-xs ml-auto">
                      {student.program}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="interactionType">Interaction Type</Label>
          <Select value={formData.interactionType} onValueChange={handleInteractionTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select interaction type" />
            </SelectTrigger>
            <SelectContent>
              {interactionTypes
                .filter((type) => type.value !== "other")
                .map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
