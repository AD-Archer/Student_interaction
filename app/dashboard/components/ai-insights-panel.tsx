/**
 * AI Insights Panel Component
 * This component displays AI-generated insights and notes for the dashboard.
 * It includes a transparent overlay to allow visibility and interaction with the rest of the page while focusing on the panel.
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, TrendingUp, AlertTriangle, Users, MessageSquare, Save, X } from "lucide-react"

interface AiInsightsPanelProps {
	isOpen: boolean
	onClose: () => void
	title?: string
	notes?: string[]
}

export function AiInsightsPanel({ isOpen, onClose, title, notes }: AiInsightsPanelProps) {
	const [newNote, setNewNote] = useState("")

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
							<h2 className="text-lg font-semibold text-gray-900">{title || "AI Insights & Notes"}</h2>
						</div>
						<Button variant="outline" size="sm" onClick={onClose}>
							<X className="h-4 w-4" />
						</Button>
					</div>

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

					{/* AI Insights */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-base flex items-center space-x-2">
								<Sparkles className="h-4 w-4 text-blue-600" />
								<span>AI Insights</span>
							</CardTitle>
							<CardDescription>Analysis of interaction patterns and notes</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							{notes && notes.length > 0 ? (
								<div>
									<h4 className="font-medium text-sm mb-2">Interaction Notes Analysis</h4>
									{notes.map((note, index) => (
										<div key={index} className="p-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-800 mb-2">
											<div className="flex items-start space-x-2">
												<MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
												<div className="flex-1">
													<p className="text-xs">{note}</p>
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="p-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-600">
									<div className="flex items-start space-x-2">
										<MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
										<div className="flex-1">
											<p className="text-xs">No interaction notes available for analysis</p>
										</div>
									</div>
								</div>
							)}
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

					{/* Recent Activity */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-base">Recent Activity</CardTitle>
							<CardDescription>Team notes and observations</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="p-3 bg-gray-50 rounded-lg border text-center">
								<p className="text-sm text-gray-500">
									Recent activity feed will be available soon
								</p>
							</div>
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
