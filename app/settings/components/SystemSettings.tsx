/**
 * SystemSettings.tsx
 * Renders all system settings including interaction frequency configuration and data management.
 * Includes CSV import functionality, data export options, and interaction timing settings.
 * This is only used on the /settings page and is not global.
 */

import { useState, useRef } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Upload, FileText, Users, Activity, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InteractionFrequencySettings } from "./InteractionFrequencySettings"

interface ImportResult {
  success: boolean
  message: string
  details: {
    totalProcessed: number
    successfulImports: number
    skipped: number
    errors: string[]
  }
}

export const SystemSettings = () => {
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [exportType, setExportType] = useState<'students' | 'interactions' | 'all'>('students')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file import
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setImportResult({
        success: false,
        message: 'Please select a CSV file',
        details: { totalProcessed: 0, successfulImports: 0, skipped: 0, errors: ['Invalid file type'] }
      })
      return
    }

    setIsImporting(true)
    setImportResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/data/import', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Import failed')
      }

      setImportResult(result)
    } catch (error) {
      setImportResult({
        success: false,
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { totalProcessed: 0, successfulImports: 0, skipped: 0, errors: [error instanceof Error ? error.message : 'Unknown error'] }
      })
    } finally {
      setIsImporting(false)
      // Reset file input
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  // Handle data export
  const handleDataExport = async () => {
    setIsExporting(true)

    try {
      const response = await fetch(`/api/data/export?type=${exportType}`)
      
      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Get filename from response headers or create default
      const contentDisposition = response.headers.get('content-disposition')
      const filenameMatch = contentDisposition?.match(/filename="([^"]*)"/)
      const filename = filenameMatch?.[1] || `${exportType}-export-${new Date().toISOString().split('T')[0]}.csv`

      // Create download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (error) {
      console.error('Export error:', error)
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Interaction Frequency Settings */}
      <InteractionFrequencySettings />
      
      {/* Data Import Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Upload className="h-5 w-5 text-blue-600" />
            <span>Import Student Data</span>
          </CardTitle>
          <CardDescription>
            Upload a CSV file containing student information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* CSV Format Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Required CSV Format:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Columns:</strong> First Name, Last Name, Email, Cohort, Student ID</p>
              <p><strong>Example:</strong></p>
              <code className="block bg-white p-2 rounded text-xs font-mono">
                First Name,Last Name,Email,Cohort,Student ID<br/>
                John,Doe,john.doe@email.com,1,0001<br/>
                Jane,Smith,jane.smith@email.com,2,0002
              </code>
            </div>
          </div>

          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="csvFile">Select CSV File</Label>
            <input
              ref={fileInputRef}
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileImport}
              disabled={isImporting}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
          </div>

          {/* Import Button */}
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isImporting}
            className="w-full sm:w-auto"
          >
            {isImporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import Students
              </>
            )}
          </Button>

          {/* Import Results */}
          {importResult && (
            <Alert className={importResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {importResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={importResult.success ? "text-green-800" : "text-red-800"}>
                <div>
                  <p className="font-medium">{importResult.message}</p>
                  <div className="mt-2 text-sm">
                    <p>Total processed: {importResult.details.totalProcessed}</p>
                    <p>Successfully imported: {importResult.details.successfulImports}</p>
                    {importResult.details.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium">Errors:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {importResult.details.errors.slice(0, 5).map((error, index) => (
                            <li key={index} className="text-xs">{error}</li>
                          ))}
                          {importResult.details.errors.length > 5 && (
                            <li className="text-xs">... and {importResult.details.errors.length - 5} more errors</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Data Export Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Download className="h-5 w-5 text-green-600" />
            <span>Export Data</span>
          </CardTitle>
          <CardDescription>
            Download your data as CSV files for backup or analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Export Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="exportType">Select Data to Export</Label>
            <Select value={exportType} onValueChange={(value: 'students' | 'interactions' | 'all') => setExportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="students">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Students Only</span>
                  </div>
                </SelectItem>
                <SelectItem value="interactions">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4" />
                    <span>Interactions Only</span>
                  </div>
                </SelectItem>
                <SelectItem value="all">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>All Data</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
            <Button 
              onClick={handleDataExport} 
              disabled={isExporting}
              className="h-16 flex-col bg-green-600 hover:bg-green-700 text-white"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mb-2"></div>
                  <span className="text-sm">Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mb-2" />
                  <span className="text-sm">Export {exportType === 'all' ? 'All Data' : exportType === 'students' ? 'Students' : 'Interactions'}</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
