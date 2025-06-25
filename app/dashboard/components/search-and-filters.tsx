"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, ChevronRight } from "lucide-react"
import { fetchInteractionTypes } from '@/lib/data'

interface StaffOption {
  id: string
  name: string
}

interface SearchAndFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedProgram: string
  setSelectedProgram: (program: string) => void
  dateFrom: string
  setDateFrom: (date: string) => void
  dateTo: string
  setDateTo: (date: string) => void
  sortOrder: string
  setSortOrder: (order: string) => void
  filteredCount: number
  showArchived: boolean
  setShowArchived: (show: boolean) => void
  staffOptions: StaffOption[]
  selectedStaff: string
  setSelectedStaff: (staffId: string) => void
  selectedType: string
  setSelectedType: (type: string) => void
  selectedStatus: string
  setSelectedStatus: (status: string) => void
  currentUserId?: string
  onResetFilters: () => void
}

export function SearchAndFilters({
  searchTerm,
  setSearchTerm,
  selectedProgram,
  setSelectedProgram,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  sortOrder,
  setSortOrder,
  filteredCount,
  showArchived,
  setShowArchived,
  staffOptions,
  selectedStaff,
  setSelectedStaff,
  selectedType,
  setSelectedType,
  selectedStatus,
  setSelectedStatus,
  currentUserId,
  onResetFilters,
}: SearchAndFiltersProps) {
  const [showFilters, setShowFilters] = useState(true)
  const [interactionTypes, setInteractionTypes] = useState<{ id: number, name: string, isDefault: boolean }[]>([])

  // Load filters from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("dashboardFilters")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.searchTerm !== undefined) setSearchTerm(parsed.searchTerm)
        if (parsed.selectedProgram !== undefined) setSelectedProgram(parsed.selectedProgram)
        if (parsed.dateFrom !== undefined) setDateFrom(parsed.dateFrom)
        if (parsed.dateTo !== undefined) setDateTo(parsed.dateTo)
        if (parsed.sortOrder !== undefined) setSortOrder(parsed.sortOrder)
        if (parsed.showArchived !== undefined) setShowArchived(parsed.showArchived)
        if (parsed.selectedStaff !== undefined) setSelectedStaff(parsed.selectedStaff)
        if (parsed.selectedType !== undefined) setSelectedType(parsed.selectedType)
        if (parsed.selectedStatus !== undefined) setSelectedStatus(parsed.selectedStatus)
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId])

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(
      "dashboardFilters",
      JSON.stringify({
        searchTerm,
        selectedProgram,
        dateFrom,
        dateTo,
        sortOrder,
        showArchived,
        selectedStaff,
        selectedType,
        selectedStatus
      })
    )
  }, [searchTerm, selectedProgram, dateFrom, dateTo, sortOrder, showArchived, selectedStaff, selectedType, selectedStatus])

  // Fetch interaction types from API
  useEffect(() => {
    fetchInteractionTypes().then(setInteractionTypes).catch(() => setInteractionTypes([]))
  }, [])

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
            <div className="flex items-center space-x-2">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetFilters}
                className="text-gray-600 hover:text-gray-800"
              >
                Reset Filters
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Showing:</span>
              <Badge variant="outline" className="text-gray-700 font-semibold bg-blue-50 border-blue-200 px-3 py-1">
                {filteredCount} {filteredCount === 1 ? 'result' : 'results'}
              </Badge>
            </div>
          </div>

          {/* Collapsible Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 pt-4 border-t">
              {/* Program filter */}
              <Select
                value={selectedProgram}
                onValueChange={setSelectedProgram}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  <SelectItem value="foundations">Foundations</SelectItem>
                  <SelectItem value="101">101</SelectItem>
                  <SelectItem value="liftoff">Liftoff</SelectItem>
                  <SelectItem value="lightspeed">Lightspeed</SelectItem>
                  <SelectItem value="alumni">Alumni</SelectItem>
                </SelectContent>
              </Select>

              {/* Date From filter */}
              <div className="flex flex-col gap-1 w-48">
                <Input
                  type="date"
                  placeholder="From Date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="border-gray-300 focus:border-blue-500"
                />
                <span className="text-xs text-gray-500 pl-1">Start date</span>
              </div>

              {/* Date To filter */}
              <div className="flex flex-col gap-1 w-48">
                <Input
                  type="date"
                  placeholder="To Date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="border-gray-300 focus:border-blue-500"
                />
                <span className="text-xs text-gray-500 pl-1">End date</span>
              </div>

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

              {/* Interaction Type filter */}
              <Select
                value={selectedType}
                onValueChange={setSelectedType}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Interaction Types</SelectItem>
                  {interactionTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status filter */}
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Completion Status</SelectItem>
                  <SelectItem value="open">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      Open
                    </div>
                  </SelectItem>
                  <SelectItem value="closed">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      Closed
                    </div>
                  </SelectItem>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Completed
                    </div>
                  </SelectItem>
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
