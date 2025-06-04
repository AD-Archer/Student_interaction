"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, ChevronRight } from "lucide-react"

interface SearchAndFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedCohort: string
  setSelectedCohort: (cohort: string) => void
  sortOrder: string
  setSortOrder: (order: string) => void
  filteredCount: number
}

export function SearchAndFilters({
  searchTerm,
  setSearchTerm,
  selectedCohort,
  setSelectedCohort,
  sortOrder,
  setSortOrder,
  filteredCount
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
              <Input
                placeholder="Enter Cohort"
                value={selectedCohort}
                onChange={(e) => setSelectedCohort(e.target.value)}
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
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
