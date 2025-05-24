"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Shield,
  Bell,
  Database,
  Mail,
  Palette,
  Globe,
  Activity,
  Sparkles,
  SettingsIcon,
} from "lucide-react"
import { StaffManagement } from "./components/StaffManagement"
import { SystemSettings } from "./components/SystemSettings"
import { NotificationPreferences } from "./components/NotificationPreferences"
import { SystemIntegrations } from "./components/SystemIntegrations"
import { AppearanceBranding } from "./components/AppearanceBranding"

const staffMembers = [
  {
    id: 1,
    name: "Barbara Cicalese",
    email: "barbara@launchpad.org",
    role: "Senior Counselor",
    status: "active",
    lastLogin: "2 hours ago",
    permissions: ["read", "write", "admin"],
  },
  {
    id: 2,
    name: "Tahir Lee",
    email: "tahir@launchpad.org",
    role: "Workforce Coordinator",
    status: "active",
    lastLogin: "Currently online",
    permissions: ["read", "write", "admin"],
  },
  {
    id: 3,
    name: "Charles Mitchell",
    email: "charles@launchpad.org",
    role: "Program Manager",
    status: "active",
    lastLogin: "1 day ago",
    permissions: ["read", "write"],
  },
]

const systemIntegrations = [
  {
    name: "Playlab AI",
    description: "AI-powered interaction summaries and insights",
    status: "connected",
    lastSync: "5 minutes ago",
    icon: Sparkles,
  },
  {
    name: "Email System",
    description: "Automated follow-up emails and notifications",
    status: "connected",
    lastSync: "1 hour ago",
    icon: Mail,
  },
  {
    name: "Database Backup",
    description: "Automated daily backups to secure cloud storage",
    status: "active",
    lastSync: "12 hours ago",
    icon: Database,
  },
  {
    name: "Analytics Engine",
    description: "Real-time data processing and reporting",
    status: "connected",
    lastSync: "Real-time",
    icon: Activity,
  },
]

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: false,
    weeklyReports: true,
    overdueReminders: true,
  })

  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    aiSummaries: true,
    dataRetention: "2years",
    sessionTimeout: "8hours",
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

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "write":
        return "bg-blue-100 text-blue-800"
      case "read":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
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
              <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm min-w-max">
                <TabsTrigger value="staff" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Staff</span>
                </TabsTrigger>
                <TabsTrigger value="system" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>System</span>
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                >
                  <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Alerts</span>
                </TabsTrigger>
                <TabsTrigger
                  value="integrations"
                  className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                >
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Integrations</span>
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                  <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Theme</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Staff Management Tab */}
            <TabsContent value="staff" className="space-y-4 sm:space-y-6">
              <StaffManagement staffMembers={staffMembers} getPermissionColor={getPermissionColor} />
            </TabsContent>

            {/* System Settings Tab */}
            <TabsContent value="system" className="space-y-4 sm:space-y-6">
              <SystemSettings systemSettings={systemSettings} setSystemSettings={setSystemSettings} />
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
              <NotificationPreferences notifications={notifications} setNotifications={setNotifications} />
            </TabsContent>

            {/* Integrations Tab */}
            <TabsContent value="integrations" className="space-y-4 sm:space-y-6">
              <SystemIntegrations systemIntegrations={systemIntegrations} getStatusColor={getStatusColor} />
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-4 sm:space-y-6">
              <AppearanceBranding />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
