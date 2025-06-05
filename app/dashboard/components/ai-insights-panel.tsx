/**
 * AI Insights Panel Component
 * This component displays AI-generated insights and notes for the dashboard.
 * It features a modern glassmorphism design, playful accents, and interactive UI for a more engaging user experience.
 * The panel overlays the dashboard with a blurred, semi-transparent background and includes animated icons, vibrant gradients, and improved layout for clarity and fun.
 * All logic and API interactions remain unchanged; only the UI/UX is enhanced for a friendlier, more modern feel.
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp, X } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { interactionsAPI } from "@/lib/api" 
import Image from "next/image"

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
	const [weeklyReport, setWeeklyReport] = useState<string | null>(null) // State to store the weekly report

	// I process AI responses to ensure proper markdown spacing and readability
	const enhanceMarkdownSpacing = (text: string): string => {
		return text
			// Ensure double line breaks after headings
			.replace(/^(#{1,6}.*?)$/gm, '$1\n\n')
			// Ensure double line breaks before headings (except at start)
			.replace(/(?<!^)\n(#{1,6})/gm, '\n\n$1')
			// Add extra spacing around horizontal rules
			.replace(/\n---\n/g, '\n\n---\n\n')
			// Ensure proper spacing after list items
			.replace(/^(\s*[-*+]\s+.*?)$/gm, '$1\n')
			// Add spacing between different list sections
			.replace(/(\n\s*[-*+].*?)\n(\s*[-*+])/gm, '$1\n\n$2')
			// Ensure paragraphs have proper spacing
			.replace(/\n([A-Z][^#\n-*+]*:)/g, '\n\n$1')
			// Clean up excessive whitespace but preserve intentional spacing
			.replace(/\n{4,}/g, '\n\n\n')
			.trim()
	}

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
					message: `Please provide detailed insights and analysis for the following student interaction data. Format your response in well-structured markdown with clear headings, bullet points, and adequate spacing between sections:\n\n${formattedNotes}\n\nPlease organize your response with:\n- ## Key Insights\n- ## Patterns and Trends\n- ## Recommendations\n- ## Action Items\n\nUse proper markdown formatting with double line breaks between sections for better readability.`
				})
			})

			if (!response.ok) {
				throw new Error(`AI summarization failed: ${response.statusText}`)
			}

			const { result } = await response.json()
			setGeneratedInsight(enhanceMarkdownSpacing(result))
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
					message: `Please generate a comprehensive weekly summary and insights for the following student interaction data from the past week. Format your response in well-structured markdown with clear headings and adequate spacing:\n\n${formattedReport}\n\nPlease organize your response with:\n- ## Weekly Summary\n- ## Key Trends\n- ## Category Analysis\n- ## Recommendations\n- ## Follow-up Actions\n\nUse proper markdown formatting with double line breaks between sections and bullet points for lists. Ensure good visual spacing for readability.`
				})
			})

			if (!response.ok) {
				throw new Error(`AI weekly report generation failed: ${response.statusText}`)
			}

			const { result } = await response.json()
			setWeeklyReport(enhanceMarkdownSpacing(result))
		} catch (error) {
			console.error("Error generating weekly report:", error)
		} finally {
			setLoading(false)
			console.log("Weekly report generation process completed.")
		}
	}

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-50 flex justify-center items-center bg-gradient-to-br from-blue-100/60 via-white/70 to-purple-100/60 backdrop-blur-xl pointer-events-auto transition-all duration-300">
			{/* Glassy overlay for modern effect */}
			<div
				className="absolute inset-0 bg-gradient-to-br from-blue-200/30 via-white/40 to-purple-200/30 backdrop-blur-xl pointer-events-auto transition-all duration-300"
				onClick={onClose}
				aria-hidden="true"
			></div>

			{/* Panel content */}
			<div className="relative h-full w-full max-w-5xl bg-white/80 border border-gray-200 shadow-2xl rounded-3xl overflow-y-auto pointer-events-auto transition-all duration-300 backdrop-blur-xl">
				<div className="p-6 space-y-6">
					{/* Header with animated sparkle */}
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<div className="relative">
								<Image
									src="/images/logos/lp_logo_transparent.png"
									alt="Launchpad"
									width={48}
									height={48}
									className="h-12 w-12 object-contain drop-shadow-lg rounded-full border-2 border-blue-200 bg-white/70"
								/>
								{/* Animated sparkle */}
								<span className="absolute -top-2 -right-2 animate-pulse">
									<Sparkles className="h-6 w-6 text-blue-400 drop-shadow-md" />
								</span>
							</div>
							<h2 className="text-2xl font-extrabold text-gray-900 tracking-tight bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent select-none">
								{title || "AI Insights"}
							</h2>
						</div>
						<Button variant="outline" size="icon" onClick={onClose} className="rounded-full border-2 border-gray-200 hover:border-pink-400 hover:bg-pink-50 transition-all duration-200 shadow-md">
							<X className="h-5 w-5 text-gray-500 group-hover:text-pink-500 transition-colors" />
						</Button>
					</div>

					{/* Student Notes */}
					{insightsMarkdown && (
						<Card className="border-0 shadow-lg bg-gradient-to-br from-white/90 to-blue-50/80 rounded-2xl">
							<CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0 border-b border-blue-100 bg-white/60 rounded-t-2xl">
								<div className="flex items-center gap-4">
									<Image
										src="/images/logos/lp_logo_transparent.png"
										alt="Launchpad"
										width={48}
										height={48}
										className="h-12 w-12 object-contain flex-shrink-0 rounded-full border border-blue-200 bg-white/80"
									/>
									<div>
										<CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
											Student Notes
										</CardTitle>
										<CardDescription className="text-sm text-blue-600">
											Interaction summary and observations
										</CardDescription>
									</div>
								</div>
								<Button
									onClick={() => {
										setLoading(true)
										const notesAsMessage = `Please analyze these student notes and provide insights:\n\n${insightsMarkdown}`
										fetch('/api/ai', {
											method: 'POST',
											headers: { 'Content-Type': 'application/json' },
											body: JSON.stringify({ message: notesAsMessage })
										})
										.then(res => res.json())
										.then(({ result }) => {
											setGeneratedInsight(enhanceMarkdownSpacing(result))
											setWeeklyReport(null)
										})
										.catch(console.error)
										.finally(() => setLoading(false))
									}}
									size="sm"
									variant="outline"
									className="flex items-center gap-1 border-blue-200 hover:border-blue-400 hover:bg-blue-100/60 transition-all duration-200 shadow-sm rounded-full px-3 py-1.5"
									disabled={loading}
								>
									<Sparkles className="h-4 w-4 text-blue-500 animate-spin-slow" />
									{loading ? "Analyzing..." : "AI Analyze"}
								</Button>
							</CardHeader>
							<CardContent className="pt-4">
								<div 
									className="text-sm text-gray-700 leading-relaxed bg-white/80 rounded-xl p-4 border border-blue-100 shadow-inner"
									style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}
								>
									{insightsMarkdown}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Interaction Notes */}
					{notes && notes.length > 0 && (
						<Card className="rounded-2xl border-0 shadow bg-gradient-to-br from-white/90 to-purple-50/80">
							<CardHeader className="pb-2 bg-white/60 rounded-t-2xl">
								<CardTitle className="text-base font-semibold text-purple-800">Interaction Notes</CardTitle>
								<CardDescription className="text-sm text-purple-600">Summary of the interaction</CardDescription>
							</CardHeader>
							<CardContent className="space-y-2">
								<div className="space-y-2">
									{notes.map((note, index) => (
										<div key={index} className="text-sm text-gray-700 leading-relaxed bg-white/80 rounded-lg p-2 border border-purple-100 shadow-sm">
											{note}
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Quick Actions */}
					<Card className="rounded-2xl border-0 shadow bg-gradient-to-br from-blue-50/80 to-pink-50/80">
						<CardHeader className="pb-2 bg-white/60 rounded-t-2xl">
							<CardTitle className="text-base font-semibold text-pink-700">Quick Actions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2 flex flex-row gap-2">
							<Button
								onClick={generateInsight}
								size="sm"
								className="flex-1 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-400/80 to-purple-400/80 text-white font-semibold shadow-md hover:from-blue-500 hover:to-purple-500 hover:scale-[1.03] active:scale-95 transition-all duration-200 min-w-[0] px-4"
								disabled={loading}
							>
								<Sparkles className="h-5 w-5 text-white drop-shadow animate-bounce" />
								{loading ? "Generating..." : "AI Insight"}
							</Button>
							<Button
								onClick={generateWeeklyReport}
								size="sm"
								className="flex-1 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-green-400/80 to-blue-400/80 text-white font-semibold shadow-md hover:from-green-500 hover:to-blue-500 hover:scale-[1.03] active:scale-95 transition-all duration-200 min-w-[0] px-4"
								disabled={loading}
							>
								<TrendingUp className="h-5 w-5 text-white drop-shadow animate-bounce" />
								Report
							</Button>
						</CardContent>
					</Card>

					{/* Display Weekly Report or AI Insight */}
					{weeklyReport ? (
						<Card className="bg-gradient-to-br from-green-50/90 to-white/80 border-green-400 rounded-2xl shadow-lg">
							<CardHeader className="pb-2 bg-white/60 rounded-t-2xl">
								<CardTitle className="text-base font-semibold text-green-700">Weekly Report</CardTitle>
								<CardDescription className="text-sm text-green-600">
									Summary of interactions from the past week
								</CardDescription>
							</CardHeader>
							<CardContent 
								className="prose prose-sm max-w-none text-green-800 text-sm bg-white/80 rounded-b-2xl p-4 shadow-inner"
								style={{ whiteSpace: 'pre-wrap', lineHeight: '1.2' }}
							>
								<div className="space-y-0">
									<ReactMarkdown 
										components={{
											h2: ({ children }) => <h2 className="text-base font-semibold mt-0.5 mb-0.5 border-b border-green-200 pb-0.5 text-green-700">{children}</h2>,
										h3: ({ children }) => <h3 className="text-sm font-medium mt-0.5 mb-0 text-green-700">{children}</h3>,
										ul: ({ children }) => <ul className="space-y-0 mb-0.5 pl-3">{children}</ul>,
										li: ({ children }) => <li className="leading-snug mb-0 text-green-800">{children}</li>,
										p: ({ children }) => <p className="mb-0.5 leading-snug text-green-800">{children}</p>
									}}
									>
										{weeklyReport}
									</ReactMarkdown>
								</div>
							</CardContent>
						</Card>
					) : generatedInsight ? (
						<Card className="bg-gradient-to-br from-blue-50/90 to-white/80 border-blue-400 rounded-2xl shadow-lg">
							<CardHeader className="pb-2 bg-white/60 rounded-t-2xl">
								<CardTitle className="text-base font-semibold text-blue-700">Generated AI Insight</CardTitle>
								<CardDescription className="text-sm text-blue-600">
									Summary of recent interactions
								</CardDescription>
							</CardHeader>
							<CardContent 
								className="prose prose-sm max-w-none text-blue-800 text-sm bg-white/80 rounded-b-2xl p-4 shadow-inner"
								style={{ whiteSpace: 'pre-wrap', lineHeight: '1.2' }}
							>
								<div className="space-y-0">
									<ReactMarkdown 
										components={{
											h2: ({ children }) => <h2 className="text-base font-semibold mt-0.5 mb-0.5 border-b border-blue-200 pb-0.5 text-blue-700">{children}</h2>,
										h3: ({ children }) => <h3 className="text-sm font-medium mt-0.5 mb-0 text-blue-700">{children}</h3>,
										ul: ({ children }) => <ul className="space-y-0 mb-0.5 pl-3">{children}</ul>,
										li: ({ children }) => <li className="leading-snug mb-0 text-blue-800">{children}</li>,
										p: ({ children }) => <p className="mb-0.5 leading-snug text-blue-800">{children}</p>
									}}
									>
										{generatedInsight}
									</ReactMarkdown>
								</div>
							</CardContent>
						</Card>
					) : null}
				</div>
			</div>
		</div>
	)
}
