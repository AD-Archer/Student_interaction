/**
 * InteractionFrequencySettings.tsx
 * Renders the configurable interaction frequency settings for different student programs.
 * Allows administrators to set how often students in each program need to be contacted,
 * plus priority escalation and follow-up rules. This is part of the system settings.
 */

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Clock, Users, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface InteractionSettings {
  defaultInteractionDays: number
  foundationsInteractionDays: number
  liftoffInteractionDays: number
  lightspeedInteractionDays: number
  program101InteractionDays: number
  priorityEscalationDays: number
  enablePriorityEscalation: boolean
  followUpGracePeriodDays: number
  autoFollowUpEnabled: boolean
}

export const InteractionFrequencySettings = () => {
  const [settings, setSettings] = useState<InteractionSettings>({
    defaultInteractionDays: 30,
    foundationsInteractionDays: 14,
    liftoffInteractionDays: 21,
    lightspeedInteractionDays: 7,
    program101InteractionDays: 30,
    priorityEscalationDays: 7,
    enablePriorityEscalation: true,
    followUpGracePeriodDays: 3,
    autoFollowUpEnabled: true
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null)

  // I load the current settings when component mounts
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings/system')
      if (response.ok) {
        const data = await response.json()
        setSettings({
          defaultInteractionDays: data.defaultInteractionDays || 30,
          foundationsInteractionDays: data.foundationsInteractionDays || 14,
          liftoffInteractionDays: data.liftoffInteractionDays || 21,
          lightspeedInteractionDays: data.lightspeedInteractionDays || 7,
          program101InteractionDays: data.program101InteractionDays || 30,
          priorityEscalationDays: data.priorityEscalationDays || 7,
          enablePriorityEscalation: data.enablePriorityEscalation ?? true,
          followUpGracePeriodDays: data.followUpGracePeriodDays || 3,
          autoFollowUpEnabled: data.autoFollowUpEnabled ?? true
        })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      setSaveResult({ success: false, message: 'Failed to load settings' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveResult(null)

    try {
      const response = await fetch('/api/settings/system', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        setSaveResult({ success: true, message: 'Settings saved successfully' })
      } else {
        const error = await response.json()
        setSaveResult({ success: false, message: error.error || 'Failed to save settings' })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveResult({ success: false, message: 'Failed to save settings' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof InteractionSettings, value: number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading settings...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
          <Clock className="h-5 w-5 text-blue-600" />
          <span>Student Interaction Frequency</span>
        </CardTitle>
        <CardDescription>
          Configure how often students in each program need to be contacted and set priority escalation rules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Program-specific settings */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-600" />
            <h3 className="text-md font-medium">Program-Specific Interaction Intervals</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="foundationsInteractionDays">Foundations Program (days)</Label>
              <Input
                id="foundationsInteractionDays"
                type="number"
                min="1"
                value={settings.foundationsInteractionDays}
                onChange={(e) => handleInputChange('foundationsInteractionDays', parseInt(e.target.value) || 1)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lightspeedInteractionDays">Lightspeed Program (days)</Label>
              <Input
                id="lightspeedInteractionDays"
                type="number"
                min="1"
                value={settings.lightspeedInteractionDays}
                onChange={(e) => handleInputChange('lightspeedInteractionDays', parseInt(e.target.value) || 1)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="liftoffInteractionDays">Liftoff Program (days)</Label>
              <Input
                id="liftoffInteractionDays"
                type="number"
                min="1"
                value={settings.liftoffInteractionDays}
                onChange={(e) => handleInputChange('liftoffInteractionDays', parseInt(e.target.value) || 1)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="program101InteractionDays">101 Program (days)</Label>
              <Input
                id="program101InteractionDays"
                type="number"
                min="1"
                value={settings.program101InteractionDays}
                onChange={(e) => handleInputChange('program101InteractionDays', parseInt(e.target.value) || 1)}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="defaultInteractionDays">Default Interaction Interval (days)</Label>
            <Input
              id="defaultInteractionDays"
              type="number"
              min="1"
              value={settings.defaultInteractionDays}
              onChange={(e) => handleInputChange('defaultInteractionDays', parseInt(e.target.value) || 1)}
              className="w-full max-w-xs"
            />
            <p className="text-sm text-gray-600">Used for programs not specifically configured above</p>
          </div>
        </div>

        <Separator />

        {/* Priority escalation settings */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <h3 className="text-md font-medium">Priority Escalation</h3>
          </div>
          
          <div className="flex items-center space-x-3">
            <Switch
              id="enablePriorityEscalation"
              checked={settings.enablePriorityEscalation}
              onCheckedChange={(checked) => handleInputChange('enablePriorityEscalation', checked)}
            />
            <Label htmlFor="enablePriorityEscalation">Enable priority escalation for overdue interactions</Label>
          </div>
          
          {settings.enablePriorityEscalation && (
            <div className="space-y-2 ml-6">
              <Label htmlFor="priorityEscalationDays">Additional days before marking as high priority</Label>
              <Input
                id="priorityEscalationDays"
                type="number"
                min="1"
                value={settings.priorityEscalationDays}
                onChange={(e) => handleInputChange('priorityEscalationDays', parseInt(e.target.value) || 1)}
                className="w-full max-w-xs"
              />
              <p className="text-sm text-gray-600">
                Students become high priority after (interaction interval + this value) days
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Follow-up settings */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <h3 className="text-md font-medium">Follow-up Management</h3>
          </div>
          
          <div className="flex items-center space-x-3">
            <Switch
              id="autoFollowUpEnabled"
              checked={settings.autoFollowUpEnabled}
              onCheckedChange={(checked) => handleInputChange('autoFollowUpEnabled', checked)}
            />
            <Label htmlFor="autoFollowUpEnabled">Enable automatic follow-up tracking</Label>
          </div>
          
          {settings.autoFollowUpEnabled && (
            <div className="space-y-2 ml-6">
              <Label htmlFor="followUpGracePeriodDays">Grace period before follow-ups are overdue (days)</Label>
              <Input
                id="followUpGracePeriodDays"
                type="number"
                min="0"
                value={settings.followUpGracePeriodDays}
                onChange={(e) => handleInputChange('followUpGracePeriodDays', parseInt(e.target.value) || 0)}
                className="w-full max-w-xs"
              />
              <p className="text-sm text-gray-600">
                Additional time allowed before follow-up dates are considered overdue
              </p>
            </div>
          )}
        </div>

        {/* Save button and result */}
        <div className="flex flex-col space-y-4 pt-4">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>

          {saveResult && (
            <Alert className={saveResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {saveResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={saveResult.success ? "text-green-800" : "text-red-800"}>
                {saveResult.message}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
