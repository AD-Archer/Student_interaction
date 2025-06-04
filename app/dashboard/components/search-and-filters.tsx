"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, ChevronRight } from "lucide-react"

interface StaffOption {
  id: string
  name: string
}

interface SearchAndFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedCohort: string
  setSelectedCohort: (cohort: string) => void
  sortOrder: string
  setSortOrder: (order: string) => void
  filteredCount: number
  showArchived: boolean
  setShowArchived: (show: boolean) => void
  staffOptions: StaffOption[]
  selectedStaff: string
  setSelectedStaff: (staffId: string) => void
}

export function SearchAndFilters({
  searchTerm,
  setSearchTerm,
  selectedCohort,
  setSelectedCohort,
  sortOrder,
  setSortOrder,
  filteredCount,
  showArchived,
  setShowArchived,
  staffOptions,
  selectedStaff,
  setSelectedStaff
}: SearchAndFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

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
                className={`h-4 w-4 transition-transform ${showFilters ? "rotate-90" : ""}`}
              />
            </Button>
            <Badge variant="outline" className="text-gray-600">
              {filteredCount} results
            </Badge>
          </div>

          {/* Collapsible Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              <Input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={1}
                step={1}
                placeholder="Enter Cohort #"
                value={selectedCohort}
                onChange={(e) => {
                  // Only allow numbers, no leading zeros
                  const val = e.target.value.replace(/[^0-9]/g, '').replace(/^0+/, '')
                  setSelectedCohort(val)
                }}
                className="w-48 border-gray-300 focus:border-blue-500"
              />

              <Select
                value={sortOrder}
                onValueChange={setSortOrder}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mostRecent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>

              {/* Staff filter */}
              <Select
                value={selectedStaff}
                onValueChange={setSelectedStaff}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  {staffOptions.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Archived filter */}
              <Button
                type="button"
                variant={showArchived ? "default" : "outline"}
                className="w-48"
                onClick={() => setShowArchived(!showArchived)}
              >
                {showArchived ? "Showing Archived" : "Hiding Archived"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
