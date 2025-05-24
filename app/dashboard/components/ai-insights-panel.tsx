/**
 * AI Insights Panel Component
 * This component displays AI-generated insights and notes for the dashboard.
 * It includes a transparent overlay to allow visibility and interaction with the rest of the page while focusing on the panel.
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, TrendingUp, AlertTriangle, Users, MessageSquare, Save, X } from "lucide-react"

const aiInsights = [
	{
		type: "trend",
		title: "Attendance Patterns",
		description: "3 students showing improved attendance after coaching sessions",
		severity: "positive",
		icon: TrendingUp,
	},
	{
		type: "alert",
		title: "Follow-up Required",
		description: "Zaire Williams has missed 2 scheduled follow-ups",
		severity: "warning",
		icon: AlertTriangle,
	},
	{
		type: "insight",
		title: "Program Success",
		description: "Lightspeed program students show 85% engagement rate",
		severity: "positive",
		icon: Users,
	},
	{
		type: "recommendation",
		title: "Intervention Needed",
		description: "Consider group coaching for time management skills",
		severity: "info",
		icon: MessageSquare,
	},
]

const recentNotes = [
	{
		id: 1,
		author: "Tahir Lee",
		content:
			"Need to follow up on Micheal's interview preparation. He's showing great progress but needs confidence building.",
		timestamp: "2 hours ago",
		priority: "high",
	},
	{
		id: 2,
		author: "Barbara Cicalese",
		content: "Amira is excelling in academic support. Consider advancing her to next program level.",
		timestamp: "4 hours ago",
		priority: "medium",
	},
	{
		id: 3,
		author: "Charles Mitchell",
		content: "Group session on career exploration was very successful. Students engaged well.",
		timestamp: "1 day ago",
		priority: "low",
	},
]

interface AiInsightsPanelProps {
	isOpen: boolean
	onClose: () => void
}

export function AiInsightsPanel({ isOpen, onClose }: AiInsightsPanelProps) {
	const [newNote, setNewNote] = useState("")

	const getSeverityColor = (severity: string) => {
		switch (severity) {
			case "positive":
				return "border-green-200 bg-green-50 text-green-800"
			case "warning":
				return "border-orange-200 bg-orange-50 text-orange-800"
			case "info":
				return "border-blue-200 bg-blue-50 text-blue-800"
			default:
				return "border-gray-200 bg-gray-50 text-gray-800"
		}
	}

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "high":
				return "bg-red-100 text-red-800"
			case "medium":
				return "bg-yellow-100 text-yellow-800"
			case "low":
				return "bg-green-100 text-green-800"
			default:
				return "bg-gray-100 text-gray-800"
		}
	}

	const handleSaveNote = () => {
		if (newNote.trim()) {
			// In a real app, this would save to the backend
			console.log("Saving note:", newNote)
			setNewNote("")
		}
	}

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
			{/* Transparent overlay to allow visibility and interaction with the page */}
			<div
				className="absolute inset-0 bg-transparent pointer-events-auto"
				onClick={onClose}
				aria-hidden="true"
			></div>

			{/* Panel content */}
			<div className="relative h-full w-96 bg-white bg-opacity-90 backdrop-blur-md border-l border-gray-200 shadow-xl overflow-y-auto pointer-events-auto">
				<div className="p-6 space-y-6">
					{/* Header */}
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<Sparkles className="h-5 w-5 text-blue-600" />
							<h2 className="text-lg font-semibold text-gray-900">AI Insights & Notes</h2>
						</div>
						<Button variant="outline" size="sm" onClick={onClose}>
							<X className="h-4 w-4" />
						</Button>
					</div>

					{/* AI Insights */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-base flex items-center space-x-2">
								<Sparkles className="h-4 w-4 text-blue-600" />
								<span>AI Insights</span>
							</CardTitle>
							<CardDescription>Automated analysis of student interactions</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							{aiInsights.map((insight, index) => (
								<div key={index} className={`p-3 rounded-lg border ${getSeverityColor(insight.severity)}`}>
									<div className="flex items-start space-x-2">
										<insight.icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
										<div className="flex-1">
											<h4 className="font-medium text-sm">{insight.title}</h4>
											<p className="text-xs mt-1 opacity-90">{insight.description}</p>
										</div>
									</div>
								</div>
							))}
						</CardContent>
					</Card>

					{/* Quick Note */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-base">Quick Note</CardTitle>
							<CardDescription>Add a note for the team</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<Textarea
								placeholder="Add a note about student interactions, observations, or reminders..."
								value={newNote}
								onChange={(e) => setNewNote(e.target.value)}
								rows={3}
								className="resize-none"
							/>
							<Button onClick={handleSaveNote} size="sm" className="w-full" disabled={!newNote.trim()}>
								<Save className="h-4 w-4 mr-2" />
								Save Note
							</Button>
						</CardContent>
					</Card>

					{/* Recent Notes */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-base">Recent Notes</CardTitle>
							<CardDescription>Team notes and observations</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							{recentNotes.map((note) => (
								<div key={note.id} className="p-3 bg-gray-50 rounded-lg border">
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm font-medium text-gray-900">{note.author}</span>
										<div className="flex items-center space-x-2">
											<Badge variant="outline" className={getPriorityColor(note.priority)}>
												{note.priority}
											</Badge>
											<span className="text-xs text-gray-500">{note.timestamp}</span>
										</div>
									</div>
									<p className="text-sm text-gray-700">{note.content}</p>
								</div>
							))}
						</CardContent>
					</Card>

					{/* Quick Actions */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-base">Quick Actions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<Button variant="outline" size="sm" className="w-full justify-start">
								<TrendingUp className="h-4 w-4 mr-2" />
								Generate Weekly Report
							</Button>
							<Button variant="outline" size="sm" className="w-full justify-start">
								<AlertTriangle className="h-4 w-4 mr-2" />
								Review Overdue Follow-ups
							</Button>
							<Button variant="outline" size="sm" className="w-full justify-start">
								<Users className="h-4 w-4 mr-2" />
								Student Progress Summary
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
