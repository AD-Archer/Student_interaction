/**
 * SystemIntegrations.tsx
 * Renders the system integrations list for the settings page.
 * Expects systemIntegrations and getStatusColor as props.
 * This is only used on the /settings page and is not global.
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Globe, CheckCircle, XCircle, Clock } from "lucide-react"
import React, { useState } from "react"
import { SystemIntegration } from "@/lib/data"

interface TestResult {
  success: boolean
  message: string
  details?: unknown
  timestamp?: string
}

export const SystemIntegrations = ({ systemIntegrations, getStatusColor }: {
  systemIntegrations: Array<SystemIntegration & { icon: React.ElementType }>,
  getStatusColor: (status: string) => string
}) => {
  const [testingStates, setTestingStates] = useState<Record<string, boolean>>({})
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({})

  const testIntegration = async (integrationName: string) => {
    // Set testing state
    setTestingStates(prev => ({ ...prev, [integrationName]: true }))
    
    try {
      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ integration: integrationName }),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Test failed')
      }

      setTestResults(prev => ({
        ...prev,
        [integrationName]: {
          success: result.success,
          message: result.message,
          details: result.details,
          timestamp: result.timestamp
        }
      }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [integrationName]: {
          success: false,
          message: error instanceof Error ? error.message : 'Test failed',
          timestamp: new Date().toISOString()
        }
      }))
    } finally {
      setTestingStates(prev => ({ ...prev, [integrationName]: false }))
    }
  }

  const getTestIcon = (integrationName: string) => {
    const result = testResults[integrationName]
    if (!result) return null
    
    if (result.success) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    } else {
      return <XCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getTestButtonText = (integrationName: string) => {
    if (testingStates[integrationName]) {
      return "Testing..."
    }
    return "Test Connection"
  }

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
          <Globe className="h-5 w-5 text-blue-600" />
          <span>System Integrations</span>
        </CardTitle>
        <CardDescription>Test external services and API connections</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {systemIntegrations.map((integration, index) => (
            <div key={index} className="p-4 sm:p-6 border rounded-xl bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-white p-2 rounded-lg">
                    <integration.icon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{integration.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{integration.description}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(integration.status)}>
                  {integration.name === "Database" ? "Database Connected" : integration.status}
                </Badge>
              </div>
              
              {/* Test Results Display */}
              {testResults[integration.name] && (
                <div className={`mb-3 p-2 rounded-lg text-xs ${
                  testResults[integration.name].success 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  <div className="flex items-center space-x-1">
                    {getTestIcon(integration.name)}
                    <span>{testResults[integration.name].message}</span>
                  </div>
                  {testResults[integration.name].timestamp && (
                    <div className="mt-1 text-xs opacity-75">
                      Tested: {new Date(testResults[integration.name].timestamp!).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full sm:w-auto"
                  onClick={() => testIntegration(integration.name)}
                  disabled={testingStates[integration.name]}
                >
                  {testingStates[integration.name] && (
                    <Clock className="h-4 w-4 mr-1 animate-spin" />
                  )}
                  {getTestButtonText(integration.name)}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
