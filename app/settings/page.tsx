"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User,
  Shield,
  Plus,
  Bell,
  Database,
  Mail,
  Palette,
  Globe,
  Lock,
  Activity,
  SettingsIcon,
  Trash2,
  Edit,
  Sparkles,
  Download,
  Upload,
} from "lucide-react"
import { MobileHeader } from "@/components/mobile-header"

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
      <MobileHeader />

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
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                    <div>
                      <CardTitle className="text-lg sm:text-xl">Staff Management</CardTitle>
                      <CardDescription>Manage team members and their access permissions</CardDescription>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Staff
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {staffMembers.map((staff) => (
                      <div
                        key={staff.id}
                        className="flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-6 border rounded-xl bg-gray-50 space-y-4 lg:space-y-0"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-2 sm:p-3 rounded-full">
                            <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{staff.name}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">{staff.email}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {staff.role}
                              </Badge>
                              <Badge variant="outline" className="text-green-700 border-green-200 text-xs">
                                {staff.status}
                              </Badge>
                              <span className="text-xs text-gray-500 hidden sm:inline">
                                Last login: {staff.lastLogin}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                          <div className="flex flex-wrap gap-1">
                            {staff.permissions.map((permission) => (
                              <Badge key={permission} className={`${getPermissionColor(permission)} text-xs`}>
                                {permission}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 sm:flex-none text-red-600 hover:text-red-700"
                            >
                              <Lock className="h-4 w-4 mr-2" />
                              Reset
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Add New Staff Form */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Add New Staff Member</CardTitle>
                  <CardDescription>Create a new account for a team member</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="staffName">Full Name</Label>
                        <Input id="staffName" placeholder="Enter full name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="staffEmail">Email Address</Label>
                        <Input id="staffEmail" type="email" placeholder="Enter email address" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="staffRole">Role/Title</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="counselor">Senior Counselor</SelectItem>
                            <SelectItem value="coordinator">Workforce Coordinator</SelectItem>
                            <SelectItem value="manager">Program Manager</SelectItem>
                            <SelectItem value="admin">System Administrator</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="permissions">Permissions</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select permission level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="read">Read Only</SelectItem>
                            <SelectItem value="write">Read & Write</SelectItem>
                            <SelectItem value="admin">Full Admin Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Staff Account
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Settings Tab */}
            <TabsContent value="system" className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <span>Security Settings</span>
                    </CardTitle>
                    <CardDescription>Configure security and access controls</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoBackup">Automatic Backups</Label>
                        <p className="text-sm text-gray-600">Daily automated data backups</p>
                      </div>
                      <Switch
                        id="autoBackup"
                        checked={systemSettings.autoBackup}
                        onCheckedChange={(checked) => setSystemSettings((prev) => ({ ...prev, autoBackup: checked }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout</Label>
                      <Select
                        value={systemSettings.sessionTimeout}
                        onValueChange={(value) => setSystemSettings((prev) => ({ ...prev, sessionTimeout: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1hour">1 hour</SelectItem>
                          <SelectItem value="4hours">4 hours</SelectItem>
                          <SelectItem value="8hours">8 hours</SelectItem>
                          <SelectItem value="24hours">24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dataRetention">Data Retention Period</Label>
                      <Select
                        value={systemSettings.dataRetention}
                        onValueChange={(value) => setSystemSettings((prev) => ({ ...prev, dataRetention: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1year">1 year</SelectItem>
                          <SelectItem value="2years">2 years</SelectItem>
                          <SelectItem value="5years">5 years</SelectItem>
                          <SelectItem value="indefinite">Indefinite</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      <span>AI & Automation</span>
                    </CardTitle>
                    <CardDescription>Configure AI features and automation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="aiSummaries">AI Summaries</Label>
                        <p className="text-sm text-gray-600">Auto-generate interaction summaries</p>
                      </div>
                      <Switch
                        id="aiSummaries"
                        checked={systemSettings.aiSummaries}
                        onCheckedChange={(checked) => setSystemSettings((prev) => ({ ...prev, aiSummaries: checked }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aiModel">AI Model</Label>
                      <Select defaultValue="gpt4">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt4">GPT-4 (Recommended)</SelectItem>
                          <SelectItem value="gpt3.5">GPT-3.5 Turbo</SelectItem>
                          <SelectItem value="claude">Claude 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aiPrompt">Custom AI Prompt</Label>
                      <Textarea id="aiPrompt" placeholder="Customize how AI analyzes interactions..." rows={3} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Data Management */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                    <Database className="h-5 w-5 text-green-600" />
                    <span>Data Management</span>
                  </CardTitle>
                  <CardDescription>Import, export, and manage your data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-16 sm:h-20 flex-col">
                      <Download className="h-5 w-5 sm:h-6 sm:w-6 mb-2" />
                      <span className="text-sm">Export Data</span>
                    </Button>
                    <Button variant="outline" className="h-16 sm:h-20 flex-col">
                      <Upload className="h-5 w-5 sm:h-6 sm:w-6 mb-2" />
                      <span className="text-sm">Import Data</span>
                    </Button>
                    <Button variant="outline" className="h-16 sm:h-20 flex-col text-red-600 hover:text-red-700">
                      <Trash2 className="h-5 w-5 sm:h-6 sm:w-6 mb-2" />
                      <span className="text-sm">Clear All Data</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                    <Bell className="h-5 w-5 text-yellow-600" />
                    <span>Notification Preferences</span>
                  </CardTitle>
                  <CardDescription>Configure how and when you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div className="space-y-4 sm:space-y-6">
                      <h3 className="font-semibold text-gray-900">Email Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="emailAlerts">Email Alerts</Label>
                            <p className="text-sm text-gray-600">Immediate alerts for urgent matters</p>
                          </div>
                          <Switch
                            id="emailAlerts"
                            checked={notifications.emailAlerts}
                            onCheckedChange={(checked) =>
                              setNotifications((prev) => ({ ...prev, emailAlerts: checked }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="weeklyReports">Weekly Reports</Label>
                            <p className="text-sm text-gray-600">Summary of weekly activities</p>
                          </div>
                          <Switch
                            id="weeklyReports"
                            checked={notifications.weeklyReports}
                            onCheckedChange={(checked) =>
                              setNotifications((prev) => ({ ...prev, weeklyReports: checked }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="overdueReminders">Overdue Reminders</Label>
                            <p className="text-sm text-gray-600">Alerts for overdue follow-ups</p>
                          </div>
                          <Switch
                            id="overdueReminders"
                            checked={notifications.overdueReminders}
                            onCheckedChange={(checked) =>
                              setNotifications((prev) => ({ ...prev, overdueReminders: checked }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                      <h3 className="font-semibold text-gray-900">Push Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="pushNotifications">Browser Notifications</Label>
                            <p className="text-sm text-gray-600">Real-time browser notifications</p>
                          </div>
                          <Switch
                            id="pushNotifications"
                            checked={notifications.pushNotifications}
                            onCheckedChange={(checked) =>
                              setNotifications((prev) => ({ ...prev, pushNotifications: checked }))
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="notificationTime">Quiet Hours</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Input type="time" defaultValue="22:00" />
                            <Input type="time" defaultValue="08:00" />
                          </div>
                          <p className="text-xs text-gray-500">No notifications during these hours</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Integrations Tab */}
            <TabsContent value="integrations" className="space-y-4 sm:space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <span>System Integrations</span>
                  </CardTitle>
                  <CardDescription>Manage external services and API connections</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-4 sm:space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                    <Palette className="h-5 w-5 text-purple-600" />
                    <span>Appearance & Branding</span>
                  </CardTitle>
                  <CardDescription>Customize the look and feel of your application</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Theme Settings</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Color Scheme</Label>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="p-3 sm:p-4 border rounded-lg bg-blue-50 border-blue-200 cursor-pointer">
                              <div className="w-full h-3 sm:h-4 bg-blue-600 rounded mb-2"></div>
                              <span className="text-xs">Blue (Default)</span>
                            </div>
                            <div className="p-3 sm:p-4 border rounded-lg hover:bg-green-50 cursor-pointer">
                              <div className="w-full h-3 sm:h-4 bg-green-600 rounded mb-2"></div>
                              <span className="text-xs">Green</span>
                            </div>
                            <div className="p-3 sm:p-4 border rounded-lg hover:bg-purple-50 cursor-pointer">
                              <div className="w-full h-3 sm:h-4 bg-purple-600 rounded mb-2"></div>
                              <span className="text-xs">Purple</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Font Size</Label>
                          <Select defaultValue="medium">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Branding</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="orgName">Organization Name</Label>
                          <Input id="orgName" defaultValue="Building 21 Workforce Development" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="logoUpload">Logo Upload</Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                            <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
