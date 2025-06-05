/**
 * settings/page.tsx
 * Settings page for Launchpad. Renders all settings tabs and enforces admin-only access to system settings and staff password reset.
 * Uses the AuthWrapper context to determine user role. Only admins can access the System tab and system settings content.
 * All other tabs are available to any authenticated user. Follows project conventions for tab/component structure.
 *
 * UI/UX: Header now uses a modern, minimal, glassy look with subtle gradients and simple icons for a premium feel.
 */

"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Shield,
  Globe,
  Mail,
  SettingsIcon,
} from "lucide-react"
import StaffManagement from "./components/StaffManagement"
import { SystemSettings } from "./components/SystemSettings"
import { SystemIntegrations } from "./components/SystemIntegrations"
import { EmailTest } from "./components/EmailTest"
import { EmailSettings } from "./components/EmailSettings"
import { CohortPhaseMappingSettings } from "./components/CohortPhaseMappingSettings"
import { InteractionFrequencySettings } from "./components/InteractionFrequencySettings"
import { StudentsSettings } from "./components/StudentsSettings"

import { resolveIconComponent } from "@/lib/utils"
import { useAuth } from "@/components/auth-wrapper"

// Centralized system integration data (define here since not exported from lib/data.ts)
const systemIntegrationData = [
  {
    name: "Playlab AI",
    description: "AI-powered interaction summaries and insights",
    status: "connected",
    lastSync: "5 minutes ago",
  },
  {
    name: "Database Connection",
    description: "A test to ensure database connectivity",
    status: "active",
    lastSync: "12 hours ago",
  },
]

// Map our centralized system integration data with icon components
const systemIntegrations = systemIntegrationData.map((integration) => {
  // Create an icon mapping for known integrations
  const iconMapping: Record<string, keyof typeof import("lucide-react")> = {
    "Playlab AI": "Sparkles",
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
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const isAdmin = user?.permissions?.includes("admin")
  
  // I get the current tab from URL params, defaulting to 'staff'
  const currentTab = searchParams?.get('tab') || 'staff'
  
  const [] = useState({
    emailAlerts: true,
    pushNotifications: false,
    weeklyReports: true,
    overdueReminders: true,
  })

  // I handle tab changes by updating the URL
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('tab', value)
    router.push(`/settings?${params.toString()}`)
  }

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
          <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-blue-100 shadow-md p-6 flex items-center gap-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-100">
              <SettingsIcon className="h-7 w-7 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">System Settings</h1>
              <p className="text-gray-500 text-sm sm:text-lg">Manage your Launchpad configuration and preferences</p>
            </div>
          </div>

          {/* Settings Tabs */}
          <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-4 sm:space-y-6">
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm min-w-max">
                <TabsTrigger value="staff" className="flex items-center space-x-1 md:space-x-3 text-xs sm:text-sm md:text-base">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  <span>Staff</span>
                </TabsTrigger>
                <TabsTrigger value="students" className="flex items-center space-x-1 md:space-x-3 text-xs sm:text-sm md:text-base">
                  {/* I use the User icon for students for now; swap if you want a different icon */}
                  <User className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  <span>Students</span>
                </TabsTrigger>
                {/* Only show System tab for admins */}
                {isAdmin && (
                  <TabsTrigger value="system" className="flex items-center space-x-1 md:space-x-3 text-xs sm:text-sm md:text-base">
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                    <span>System</span>
                  </TabsTrigger>
                )}
                <TabsTrigger value="email" className="flex items-center space-x-1 md:space-x-3 text-xs sm:text-sm md:text-base">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  <span>Email</span>
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

            {/* Students Settings Tab */}
            <TabsContent value="students" className="space-y-4 sm:space-y-6">
              <div className="w-full px-0 lg:px-0">
                <StudentsSettings />
              </div>
            </TabsContent>

            {/* System Settings Tab - only render for admins */}
            {isAdmin && (
              <TabsContent value="system" className="space-y-4 sm:space-y-6">
                <div className="w-full px-0 lg:px-0 space-y-6">
                  <CohortPhaseMappingSettings />
                  <InteractionFrequencySettings />
                  <SystemSettings />
                </div>
              </TabsContent>
            )}

            {/* Email Settings Tab */}
            <TabsContent value="email" className="space-y-4 sm:space-y-6">
              <div className="w-full px-0 lg:px-0">
                <EmailSettings />
              </div>
            </TabsContent>

            {/* Integrations Tab */}
            <TabsContent value="integrations" className="space-y-4 sm:space-y-6">
              <div className="w-full px-0 lg:px-0 space-y-6">
                <SystemIntegrations systemIntegrations={systemIntegrations} getStatusColor={getStatusColor} />
                <EmailTest />
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </main>
    </div>
  )
}
