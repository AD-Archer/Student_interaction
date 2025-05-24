/**
 * AppearanceBranding.tsx
 * Renders the appearance and branding settings for the settings page.
 * This is only used on the /settings page and is not global.
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Palette, Upload } from "lucide-react"
import React from "react"

export const AppearanceBranding = () => (
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
)
