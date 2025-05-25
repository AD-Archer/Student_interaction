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
import { useState, useEffect } from "react";
import { Loader } from "@/components/ui/loader";
import { KeyMetrics } from "./components/KeyMetrics"
import { InteractionTrends } from "./components/InteractionTrends"
import { InteractionTypes } from "./components/InteractionTypes"
import { ProgramPerformance } from "./components/ProgramPerformance"
import { StaffPerformance } from "./components/StaffPerformance"
import { QuickInsights } from "./components/QuickInsights"
import { interactionTrends, programData, staffPerformance, interactionTypes } from "@/lib/data"

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
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Simulate data fetching
		const fetchData = async () => {
			setIsLoading(true);
			await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulated delay
			setIsLoading(false);
		};
		fetchData();
	}, []);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
				<Loader /> {/* Replace with your actual loading animation */}
			</div>
		);
	}

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
	);
}
