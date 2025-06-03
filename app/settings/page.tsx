"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Shield,
  Globe,
  SettingsIcon,
} from "lucide-react"
import StaffManagement from "./components/StaffManagement"
import { SystemSettings } from "./components/SystemSettings"
import { SystemIntegrations } from "./components/SystemIntegrations"
import { systemIntegrationData } from "@/lib/data"
import { resolveIconComponent } from "@/lib/utils"

// Map our centralized system integration data with icon components
const systemIntegrations = systemIntegrationData.map(integration => {
  // Create an icon mapping for known integrations
  const iconMapping: Record<string, keyof typeof import("lucide-react")> = {
    "Playlab AI": "Sparkles",
    "Email System": "Mail",
    "Database Connection": "Database"
  };
  
  // Get the icon name or use a default
  const iconName = iconMapping[integration.name] || "Globe";
  
  // Return the integration with the resolved icon component
  return {
    ...integration,
    icon: resolveIconComponent(iconName)
  };
});

export default function SettingsPage() {
  const [] = useState({
    emailAlerts: true,
    pushNotifications: false,
    weeklyReports: true,
    overdueReminders: true,
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "disconnected":
        return "bg-red-100 text-red-800 border-red-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <main className="px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-full mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-white/20 p-2 sm:p-3 rounded-full">
                <SettingsIcon className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">System Settings</h1>
                <p className="text-blue-100 text-sm sm:text-lg">Manage your Launchpad configuration and preferences</p>
              </div>
            </div>
          </div>

          {/* Settings Tabs */}
          <Tabs defaultValue="staff" className="space-y-4 sm:space-y-6">
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm min-w-max">
                <TabsTrigger value="staff" className="flex items-center space-x-1 md:space-x-3 text-xs sm:text-sm md:text-base">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  <span>Staff</span>
                </TabsTrigger>
                <TabsTrigger value="system" className="flex items-center space-x-1 md:space-x-3 text-xs sm:text-sm md:text-base">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  <span>System</span>
                </TabsTrigger>
                
                <TabsTrigger
                  value="integrations"
                  className="flex items-center space-x-1 md:space-x-3 text-xs sm:text-sm md:text-base"
                >
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  <span>Integrations</span>
                </TabsTrigger>
               
              </TabsList>
            </div>

            {/* Staff Management Tab */}
            <TabsContent value="staff" className="space-y-4 sm:space-y-6">
              <div className="w-full px-0 lg:px-0">
                <StaffManagement />
              </div>
            </TabsContent>

            {/* System Settings Tab */}
            <TabsContent value="system" className="space-y-4 sm:space-y-6">
              <div className="w-full px-0 lg:px-0">
                <SystemSettings />
              </div>
            </TabsContent>


            {/* Integrations Tab */}
            <TabsContent value="integrations" className="space-y-4 sm:space-y-6">
              <div className="w-full px-0 lg:px-0">
                <SystemIntegrations systemIntegrations={systemIntegrations} getStatusColor={getStatusColor} />
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </main>
    </div>
  )
}
