/**
 * NotificationPreferences.tsx
 * Renders the notification preferences (email and push) for the settings page.
 * Expects notifications and setNotifications as props.
 * This is only used on the /settings page and is not global.
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bell } from "lucide-react"
import React from "react"

export type NotificationPreferencesState = {
  emailAlerts: boolean
  pushNotifications: boolean
  weeklyReports: boolean
  overdueReminders: boolean
}

export const NotificationPreferences = ({ notifications, setNotifications }: {
  notifications: NotificationPreferencesState
  setNotifications: React.Dispatch<React.SetStateAction<NotificationPreferencesState>>
}) => (
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
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, emailAlerts: checked }))}
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
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, weeklyReports: checked }))}
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
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, overdueReminders: checked }))}
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
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, pushNotifications: checked }))}
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
)
