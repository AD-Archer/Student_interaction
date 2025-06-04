/**
 * AI Insights Panel Component
 * This component displays AI-generated insights and notes for the dashboard.
 * It includes a transparent overlay to allow visibility and interaction with the rest of the page while focusing on the panel.
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp, X } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { interactionsAPI } from "@/lib/api" 

interface AiInsightsPanelProps {
	isOpen: boolean
	onClose: () => void
	title?: string
	notes?: string[]
	insightsMarkdown?: string // New prop for markdown insightsg
}

interface Interaction {
	id: number
	notes: string
	staffMemberId: number
	reason?: string // Reason for the interaction
	date?: string // Date of the interaction
	// Add other relevant fields as needed
}

export function AiInsightsPanel({ isOpen, onClose, title, notes, insightsMarkdown }: AiInsightsPanelProps) {
	const [generatedInsight, setGeneratedInsight] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [weeklyReport, setWeeklyReport] = useState<string | null>(null); // State to store the weekly report

	const generateInsight = async () => {
		try {
			console.log("Starting insight generation...")
			setLoading(true)

			// Reset the weekly report state to ensure only one card appears
			setWeeklyReport(null)

			// Fetch interactions for the current staff member (replace with actual staff ID logic)
			const staffMemberId = 1 // Placeholder value
			const userInteractions: Interaction[] = await interactionsAPI.getByStaffMember(staffMemberId)

			// Group notes by categories and format them into markdown
			const categorizedNotes = userInteractions.reduce((acc, interaction) => {
				const category = interaction.reason || "General"
				if (!acc[category]) acc[category] = []
				acc[category].push(`- **${interaction.notes}**\n  - Staff: ${interaction.staffMemberId || "N/A"}\n  - Date: ${interaction.date || "N/A"}`)
				return acc
			}, {} as Record<string, string[]>)

			const formattedNotes = Object.entries(categorizedNotes)
				.map(([category, notes]) => `## ${category}\n\n${notes.join("\n\n")}`)
				.join("\n\n---\n\n")

			// Send formatted notes to AI for summarization
			const response = await fetch('/api/ai', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					message: `Please provide insights and analysis for the following student interaction data:\n\n${formattedNotes}`
				})
			})

			if (!response.ok) {
				throw new Error(`AI summarization failed: ${response.statusText}`)
			}

			const { result } = await response.json()
			setGeneratedInsight(result)
		} catch (error) {
			console.error("Error generating AI insight:", error)
		} finally {
			setLoading(false)
			console.log("Insight generation process completed.")
		}
	}

	const generateWeeklyReport = async () => {
		try {
			console.log("Starting weekly report generation...")
			setLoading(true)

			// Reset the generated insight state to ensure only one card appears
			setGeneratedInsight(null)

			// Calculate the date range for the past week
			const today = new Date()
			const lastWeek = new Date()
			lastWeek.setDate(today.getDate() - 7)

			console.log("Fetching interactions from:", lastWeek, "to:", today)

			// Fetch interactions from the past week
			const userInteractions: Interaction[] = await interactionsAPI.getByDateRange(lastWeek, today)
			console.log("Fetched weekly interactions:", userInteractions)

			// Group notes by categories and add context, removing duplicates
			const categorizedNotes = userInteractions.reduce((acc, interaction) => {
				const category = interaction.reason || "General"
				if (!acc[category]) acc[category] = new Set()
				acc[category].add(`- **${interaction.notes}**\n  - Staff: ${interaction.staffMemberId || "N/A"}\n  - Date: ${interaction.date || "N/A"}`)
				return acc
			}, {} as Record<string, Set<string>>)

			// Format the notes into markdown
			const formattedReport = Object.entries(categorizedNotes)
				.map(([category, notes]) => `## ${category}\n\n${Array.from(notes).join("\n\n")}`)
				.join("\n\n---\n\n")

			console.log("Generated weekly report:", formattedReport)

			// Send formatted report to AI for analysis
			const response = await fetch('/api/ai', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					message: `Please generate a weekly summary and insights for the following student interaction data from the past week:\n\n${formattedReport}`
				})
			})

			if (!response.ok) {
				throw new Error(`AI weekly report generation failed: ${response.statusText}`)
			}

			const { result } = await response.json()
			setWeeklyReport(result)
		} catch (error) {
			console.error("Error generating weekly report:", error)
		} finally {
			setLoading(false)
			console.log("Weekly report generation process completed.")
		}
	}

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-50 flex justify-center items-center bg-white bg-opacity-90 backdrop-blur-md pointer-events-auto">
			{/* Transparent overlay to allow visibility and interaction with the page */}
			<div
				className="absolute inset-0 bg-transparent pointer-events-auto"
				onClick={onClose}
				aria-hidden="true"
			></div>

			{/* Panel content */}
			<div className="relative h-full w-full max-w-5xl bg-white border border-gray-200 shadow-xl overflow-y-auto pointer-events-auto">
				<div className="p-6 space-y-6">
					{/* Header */}
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<Sparkles className="h-5 w-5 text-blue-600" />
							<h2 className="text-lg font-semibold text-gray-900">{title || "AI Insights"}</h2>
						</div>
						<Button variant="outline" size="sm" onClick={onClose}>
							<X className="h-4 w-4" />
						</Button>
					</div>

					{/* Markdown Insights */}
					{insightsMarkdown && (
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-base">AI Insights</CardTitle>
								<CardDescription>Insights for all interactions for the current staff</CardDescription>
							</CardHeader>
							<CardContent className="prose prose-sm max-w-none">
								<ReactMarkdown>{insightsMarkdown}</ReactMarkdown>
							</CardContent>
						</Card>
					)}

					{/* Interaction Notes */}
					{notes && notes.length > 0 && (
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-base">Interaction Notes</CardTitle>
								<CardDescription>Summary of the interaction</CardDescription>
							</CardHeader>
							<CardContent className="space-y-2">
								<ul className="list-disc pl-5">
									{notes.map((note, index) => (
										<li key={index} className="text-sm text-gray-700">
											{note}
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					)}

					{/* Quick Actions */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<Button
								onClick={generateInsight}
								size="sm"
								className="w-full flex items-center justify-start gap-2"
								disabled={loading}
							>
								<Sparkles className="h-4 w-4 text-blue-600" />
								{loading ? "Generating..." : "Generate AI Insight"}
							</Button>
							<Button
								onClick={generateWeeklyReport}
								size="sm"
								className="w-full flex items-center justify-start gap-2"
								disabled={loading}
							>
								<TrendingUp className="h-4 w-4 text-green-600" />
								Generate Weekly Report
							</Button>
						</CardContent>
					</Card>

					{/* Display Weekly Report or AI Insight */}
					{weeklyReport ? (
						<Card className="bg-green-50 border-green-400">
							<CardHeader className="pb-3">
								<CardTitle className="text-base font-semibold text-green-700">Weekly Report</CardTitle>
								<CardDescription className="text-sm text-green-600">
									Summary of interactions from the past week
								</CardDescription>
							</CardHeader>
							<CardContent className="prose prose-sm max-w-none text-green-800">
								<ReactMarkdown>{weeklyReport}</ReactMarkdown>
							</CardContent>
						</Card>
					) : generatedInsight ? (
						<Card className="bg-blue-50 border-blue-400">
							<CardHeader className="pb-3">
								<CardTitle className="text-base font-semibold text-blue-700">Generated AI Insight</CardTitle>
								<CardDescription className="text-sm text-blue-600">
									Summary of recent interactions
								</CardDescription>
							</CardHeader>
							<CardContent className="prose prose-sm max-w-none text-blue-800">
								<ReactMarkdown>{generatedInsight}</ReactMarkdown>
							</CardContent>
						</Card>
					) : null}
				</div>
			</div>
		</div>
	)
}
