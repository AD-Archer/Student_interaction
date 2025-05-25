/**
 * insights-overview.tsx
 * This component renders an overview of key metrics for the analytics page.
 * It focuses on the number of students needing new interactions, follow-ups, and overdue follow-ups.
 * This component is specific to the analytics page and uses recharts for data visualization.
 */

"use client"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card } from "@/components/ui/card"

// Mock data for the new metrics
const metricsData = [
  { category: "New Interactions", count: 120, color: "#4f46e5" },
  { category: "Follow-Ups", count: 80, color: "#10b981" },
  { category: "Overdue Follow-Ups", count: 30, color: "#ef4444" },
]

export function InsightsOverview() {
  return (
    <Card className="shadow-lg flex flex-col items-center p-4">
      <div className="h-64 w-full max-w-md">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={metricsData}
              dataKey="count"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={5}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            >
              {metricsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-md">
        {metricsData.map((metric, index) => (
          <div key={index} className="flex flex-col items-center p-2 border rounded-lg shadow-sm">
            <span
              className="inline-block w-4 h-4 rounded-full mb-2"
              style={{ backgroundColor: metric.color }}
            ></span>
            <span className="text-sm font-medium text-center">
              {metric.category}
            </span>
            <span className="text-lg font-bold">
              {metric.count}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
