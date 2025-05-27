"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, ChevronRight } from "lucide-react"
import { Student, InteractionTypeOption, StaffMember } from "@/lib/data"

interface SearchAndFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedStudent: string
  setSelectedStudent: (student: string) => void
  selectedType: string
  setSelectedType: (type: string) => void
  selectedStaff: string
  setSelectedStaff: (staff: string) => void
  filteredCount: number
  students: Student[]
  interactionTypes: InteractionTypeOption[]
  staff: StaffMember[]
}

export function SearchAndFilters({
  searchTerm,
  setSearchTerm,
  selectedStudent,
  setSelectedStudent,
  selectedType,
  setSelectedType,
  selectedStaff,
  setSelectedStaff,
  filteredCount,
  students,
  interactionTypes,
  staff
}: SearchAndFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  // Transform staff to use in filter dropdown
  const staffOptions = [
    { id: "all", name: "All Staff" },
    ...staff.map(staffMember => ({ id: staffMember.id.toString(), name: staffMember.name }))
  ]

  return (
    <Card className="shadow-lg">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search interactions, students, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-blue-500"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              <ChevronRight
                className={`h-4 w-4 transition-transform ${
                  showFilters ? "rotate-90" : ""
                }`}
              />
            </Button>
            <Badge variant="outline" className="text-gray-600">
              {filteredCount} results
            </Badge>
          </div>

          {/* Collapsible Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
              <Select
                value={selectedStudent}
                onValueChange={setSelectedStudent}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  {interactionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by staff" />
                </SelectTrigger>
                <SelectContent>
                  {staffOptions.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
