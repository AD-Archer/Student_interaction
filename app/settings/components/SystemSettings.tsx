/**
 * SystemSettings.tsx
 * Renders the system settings (security, AI, data management) for the settings page.
 * Expects systemSettings, setSystemSettings, and all handlers as props.
 * This is only used on the /settings page and is not global.
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Shield, Sparkles, Database, Download, Upload, Trash2 } from "lucide-react"
import React from "react"

export type SystemSettingsState = {
  autoBackup: boolean
  aiSummaries: boolean
  dataRetention: string
  sessionTimeout: string
}

export const SystemSettings = ({ systemSettings, setSystemSettings }: {
  systemSettings: SystemSettingsState
  setSystemSettings: React.Dispatch<React.SetStateAction<SystemSettingsState>>
}) => (
  <>
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
    <Card className="shadow-lg mt-6">
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
  </>
)
