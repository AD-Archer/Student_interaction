/**
 * SystemSettings.tsx
 * Renders system-level settings including data management tools like CSV import/export and database operations.
 * Includes CSV import functionality, data export options, and database flush capabilities.
 * This is only used on the /settings page and is not global.
 */

import { useState, useRef } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Upload, FileText, Users, Activity, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

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
  const [showFlushDialog, setShowFlushDialog] = useState(false)
  const [isFlushing, setIsFlushing] = useState(false)
  const [flushError, setFlushError] = useState<string | null>(null)
  const [showCreateUser, setShowCreateUser] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

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

  // I handle the flush database action
  const handleFlushDatabase = async () => {
    setIsFlushing(true)
    setFlushError(null)
    try {
      const res = await fetch("/api/admin/flush-db", { method: "POST" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Flush failed")
      }
      
      const result = await res.json()
      console.log('Database flushed:', result.message)
      
      setShowFlushDialog(false)
      setShowCreateUser(true)
    } catch (err) {
      setFlushError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsFlushing(false)
    }
  }

  // I handle user creation after flush
  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFlushError(null)
    
    const form = e.currentTarget
    const formData = new FormData(form)
    
    const userData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role: "System Administrator",
      permissions: ["read", "write", "admin"],
      isAdmin: true
    }
    
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        body: JSON.stringify(userData),
        headers: { "Content-Type": "application/json" }
      })
      
      if (res.ok) {
        setShowCreateUser(false)
        alert("Admin user created successfully! You can now log in with your new credentials.")
        // I redirect to login page since the current session is invalid
        router.push('/login')
      } else {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to create user")
      }
    } catch (error) {
      setFlushError(error instanceof Error ? error.message : "Failed to create user. Please try again.")
    }
  }

  return (
    <div className="w-full space-y-6">
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
              {/*
                I want users to know that only the order of columns matters for import, not the column names.
                This is because our import logic maps columns by position, not by header name, to support messy or extra columns.
                Only the first five columns are used: First Name, Last Name, Email, Cohort, Student ID (in that order).
                Extra columns are ignored.
              */}
              <p><strong>Required Order:</strong> First Name, Last Name, Email, Cohort, Student ID</p>
              <p className="text-xs text-gray-600">Column names do <b>not</b> need to match exactly, and extra columns are ignored. Only the order matters. Please ensure your CSV has the required fields in this order, even if your file has additional columns or different headers.</p>
              <p><strong>Example (messy header is OK):</strong></p>
              <code className="block bg-white p-2 rounded text-xs font-mono">
                Student Number,Last Name,First Name,Email,Grade Level,uniqueID,Cohort,Status<br/>
                LP0001,LastA,FirstA,studenta@example.com,101,LastA,2,E<br/>
                LP0002,LastB,FirstB,studentb@example.com,101,LastB,2,E
              </code>
              <p className="text-xs text-gray-600 mt-1">In the above example, only the columns in positions 3 (First Name), 2 (Last Name), 4 (Email), 7 (Cohort), and 1 (Student ID) will be used. All other columns are ignored.</p>
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

      {/* Danger Zone */}
      <Card className="shadow-lg border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl text-red-700">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span>Danger Zone</span>
          </CardTitle>
          <CardDescription>
            This action will permanently delete all students, staff, interactions, and all data. After flushing, you will be prompted to create a new admin account. <b>This cannot be undone.</b>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setShowFlushDialog(true)} disabled={isFlushing}>
            {isFlushing ? "Flushing..." : "Flush Database"}
          </Button>
        </CardContent>
      </Card>

      {/* Flush Confirmation Dialog */}
      <Dialog open={showFlushDialog} onOpenChange={() => setShowFlushDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Database Flush</DialogTitle>
          </DialogHeader>
          <p className="mb-4 text-red-700">Are you sure you want to delete <b>ALL</b> data? This cannot be undone.</p>
          {flushError && <Alert className="border-red-200 bg-red-50 text-red-800 mb-2">{flushError}</Alert>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFlushDialog(false)} disabled={isFlushing}>Cancel</Button>
            <Button variant="destructive" onClick={handleFlushDatabase} disabled={isFlushing}>Yes, Delete Everything</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create First User Dialog */}
      <Dialog open={showCreateUser} onOpenChange={() => setShowCreateUser(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Create New Admin Account</span>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Database has been cleared. Create a new admin account to continue using the system.
              </AlertDescription>
            </Alert>
            
            {flushError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{flushError}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                  <input 
                    id="firstName"
                    name="firstName" 
                    required 
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                  <input 
                    id="lastName"
                    name="lastName" 
                    required 
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <input 
                  id="email"
                  name="email" 
                  type="email" 
                  required 
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                  placeholder="admin@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <input 
                  id="password"
                  name="password" 
                  type="password" 
                  required 
                  minLength={6}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                  placeholder="Enter secure password (min 6 characters)"
                />
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs text-gray-600">
                  <strong>Note:</strong> This account will have full administrative privileges including the ability to manage all users, students, and system settings.
                </p>
              </div>
              
              <DialogFooter>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateUser(false)} 
                    disabled={isFlushing}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isFlushing}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isFlushing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Users className="h-4 w-4 mr-2" />
                        Create Admin Account
                      </>
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
