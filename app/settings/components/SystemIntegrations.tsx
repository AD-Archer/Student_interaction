/**
 * SystemIntegrations.tsx
 * Renders the system integrations list for the settings page.
 * Expects systemIntegrations and getStatusColor as props.
 * This is only used on the /settings page and is not global.
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Globe } from "lucide-react"
import React from "react"

export const SystemIntegrations = ({ systemIntegrations, getStatusColor }: {
  systemIntegrations: Array<{
    name: string
    description: string
    status: string
    lastSync: string
    icon: React.ElementType
  }>,
  getStatusColor: (status: string) => string
}) => (
  <Card className="shadow-lg w-full">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
        <Globe className="h-5 w-5 text-blue-600" />
        <span>System Integrations</span>
      </CardTitle>
      <CardDescription>Manage external services and API connections</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
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
              <Badge className={getStatusColor(integration.status)}>{integration.status}</Badge>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <span className="text-xs text-gray-500">Last sync: {integration.lastSync}</span>
              <div className="flex space-x-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                  Configure
                </Button>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                  Test
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)
