/**
 * CohortPhaseMappingSettings.tsx
 * Renders a card for mapping each Launchpad program phase to its current cohort number (e.g., Liftoff = 1, 101 = 2, etc).
 * Allows administrators to update which cohort is in each phase, and saves the mapping to system settings (cohortPhaseMap).
 * This mapping is used throughout the app for interaction frequency and reporting.
 *
 * Note: The UI now presents each phase as a label with a number input for the cohort.
 */

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Users, Loader2, CheckCircle, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const PHASES = [
  { value: 'liftoff', label: 'Liftoff' },
  { value: '101', label: '101' },
  { value: 'foundations', label: 'Foundations' }
]

interface CohortPhaseMap {
  [cohort: string]: string
}

export const CohortPhaseMappingSettings = () => {
  // I default to 3 phases mapped to cohorts, but you can add more in the UI or backend as needed
  const [cohortPhaseMap, setCohortPhaseMap] = useState<CohortPhaseMap>({ "liftoff": "1", "101": "2", "foundations": "3" })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings/system')
      if (response.ok) {
        const data = await response.json()
        setCohortPhaseMap(data.cohortPhaseMap || { "liftoff": "1", "101": "2", "foundations": "3" })
      }
    } catch {
      setSaveResult({ success: false, message: 'Failed to load mapping' })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhaseCohortChange = (phase: string, cohort: string) => {
    setCohortPhaseMap(prev => ({ ...prev, [phase]: cohort }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveResult(null)
    try {
      const response = await fetch('/api/settings/system', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cohortPhaseMap })
      })
      if (response.ok) {
        setSaveResult({ success: true, message: 'Mapping saved successfully' })
      } else {
        const error = await response.json()
        setSaveResult({ success: false, message: error.error || 'Failed to save mapping' })
      }
    } catch {
      setSaveResult({ success: false, message: 'Failed to save mapping' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading mapping...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
          <Users className="h-5 w-5 text-blue-600" />
          <span>Phase-to-Cohort Mapping</span>
        </CardTitle>
        <CardDescription>
          Assign the current cohort number for each Launchpad program phase. This controls interaction frequency and reporting everywhere in Launchpad.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PHASES.map(phase => (
            <div key={phase.value} className="space-y-2">
              <Label htmlFor={`phase-cohort-${phase.value}`}>{phase.label} Phase</Label>
              <input
                id={`phase-cohort-${phase.value}`}
                type="number"
                min="1"
                value={cohortPhaseMap[phase.value] || ''}
                onChange={e => handlePhaseCohortChange(phase.value, e.target.value)}
                className="w-full border rounded px-2 py-1"
                placeholder="Cohort #"
              />
            </div>
          ))}
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto mt-4">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Mapping
            </>
          )}
        </Button>
        {saveResult && (
          <Alert className={saveResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {saveResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={saveResult.success ? "text-green-800" : "text-red-800"}>
              {saveResult.message}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
