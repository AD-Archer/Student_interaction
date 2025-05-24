// -----------------------------------------------------------------------------
// page.tsx
// This is the main page for the /analytics route. It composes the analytics dashboard
// by importing and rendering page-specific components from ./components. All mock data
// and utility functions are defined here and passed as props to the relevant components.
// Future devs: keep this file focused on layout and data wiring, not UI details.
// -----------------------------------------------------------------------------

"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Download, TrendingUp, TrendingDown, Activity } from "lucide-react"
import { KeyMetrics } from "./components/KeyMetrics"
import { InteractionTrends } from "./components/InteractionTrends"
import { InteractionTypes } from "./components/InteractionTypes"
import { ProgramPerformance } from "./components/ProgramPerformance"
import { StaffPerformance } from "./components/StaffPerformance"
import { QuickInsights } from "./components/QuickInsights"

// Mock data for charts (I keep this here for now, but move to a data layer if it grows)
const interactionTrends = [
	{ month: "Jan", interactions: 45, followUps: 12 },
	{ month: "Feb", interactions: 52, followUps: 15 },
	{ month: "Mar", interactions: 48, followUps: 11 },
	{ month: "Apr", interactions: 61, followUps: 18 },
	{ month: "May", interactions: 55, followUps: 14 },
	{ month: "Jun", interactions: 67, followUps: 20 },
]

const programData = [
	{ program: "Foundations", students: 8, interactions: 24, successRate: 87 },
	{ program: "101", students: 6, interactions: 18, successRate: 92 },
	{ program: "Lightspeed", students: 5, interactions: 15, successRate: 85 },
	{ program: "Liftoff", students: 4, interactions: 12, successRate: 90 },
]

const staffPerformance = [
	{ name: "Tahir Lee", interactions: 28, avgRating: 4.8, followUpRate: 95 },
	{ name: "Barbara Cicalese", interactions: 25, avgRating: 4.9, followUpRate: 98 },
	{ name: "Charles Mitchell", interactions: 22, avgRating: 4.7, followUpRate: 92 },
]

const interactionTypes = [
	{ type: "Coaching", count: 32, percentage: 45, trend: "up" },
	{ type: "Academic Support", count: 18, percentage: 25, trend: "up" },
	{ type: "Career Counseling", count: 12, percentage: 17, trend: "stable" },
	{ type: "Performance Improvement", count: 6, percentage: 8, trend: "down" },
	{ type: "Behavioral Intervention", count: 4, percentage: 5, trend: "down" },
]

// I keep this utility here for icon selection, pass to child as needed
const getTrendIcon = (trend: string) => {
	switch (trend) {
		case "up":
			return <TrendingUp className="h-4 w-4 text-green-600" />
		case "down":
			return <TrendingDown className="h-4 w-4 text-red-600" />
		default:
			return <Activity className="h-4 w-4 text-gray-600" />
	}
}

export default function AnalyticsPage() {
	// I keep the header and filter controls here for clarity
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
			<main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
				<div className="space-y-6 sm:space-y-8">
					{/* Header Section */}
					<div className="space-y-4">
						<div>
							<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
								Analytics Dashboard
							</h1>
							<p className="text-gray-600 mt-2">
								Insights and trends for student interactions
							</p>
						</div>
						<div className="flex flex-col sm:flex-row gap-3">
							<Select defaultValue="30days">
								<SelectTrigger className="w-full sm:w-40">
									<SelectValue placeholder="Time period" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="7days">Last 7 days</SelectItem>
									<SelectItem value="30days">Last 30 days</SelectItem>
									<SelectItem value="90days">Last 90 days</SelectItem>
									<SelectItem value="year">This year</SelectItem>
								</SelectContent>
							</Select>
							<div className="flex gap-2">
								<Button variant="outline" className="flex-1 sm:flex-none">
									<Filter className="h-4 w-4 mr-2" />
									Filters
								</Button>
								<Button className="flex-1 sm:flex-none">
									<Download className="h-4 w-4 mr-2" />
									Export
								</Button>
							</div>
						</div>
					</div>

					{/* Key Metrics */}
					<KeyMetrics />

					{/* Charts Section */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
						<InteractionTrends data={interactionTrends} />
						<InteractionTypes
							types={interactionTypes}
							getTrendIcon={getTrendIcon}
						/>
					</div>

					{/* Program Performance */}
					<ProgramPerformance data={programData} />

					{/* Staff Performance */}
					<StaffPerformance data={staffPerformance} />

					{/* Quick Insights */}
					<QuickInsights />
				</div>
			</main>
		</div>
	)
}
