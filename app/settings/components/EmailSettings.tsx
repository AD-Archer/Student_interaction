/**
 * This file provides comprehensive email configuration settings for the Launchpad Student Interaction Tracker.
 * It allows users to configure email templates, sending preferences, and testing functionality.
 * This component integrates with the main settings page and provides real-time email testing capabilities.
 */

"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Settings, TestTube } from "lucide-react"

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  variables: string[]
}

interface EmailSettings {
  enabled: boolean
  fromName: string
  fromEmail: string
  replyTo: string
  templates: EmailTemplate[]
  sendImmediately: boolean
  sendTestEmails: boolean
  ccStaffOnStudentEmails: boolean
  bccAdmin: boolean
  adminEmail: string
}

export function EmailSettings() {
  const [settings, setSettings] = useState<EmailSettings | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("student-followup")
  const [testEmail, setTestEmail] = useState("")
  const [testLoading, setTestLoading] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  // Load email settings from the database on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings/email")
        const data = await response.json()
        setSettings(data)
      } catch (error) {
        console.error("Failed to load email settings:", error)
      }
    }

    fetchSettings()
  }, [])

  // Save email settings to the database
  const saveSettings = async (updatedSettings: EmailSettings) => {
    try {
      // Validate templates before sending to the API
      if (updatedSettings.templates) {
        for (const template of updatedSettings.templates) {
          if (!template.name || !template.subject || !template.body) {
            throw new Error("Each template must have 'name', 'subject', and 'body' fields")
          }
        }
      }

      const response = await fetch("/api/settings/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      })

      // Enhanced error handling
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save email settings")
      }

      setSettings(updatedSettings)
    } catch (error) {
      console.error("Failed to save email settings:", error)
    }
  }

  if (!settings) {
    return <div>Loading email settings...</div>
  }

  // Ensure templates field is initialized if undefined
  if (!settings.templates) {
    settings.templates = [];
  }

  /**
   * I update a specific email setting by key, inferring the value type from EmailSettings.
   */
  const handleSettingsChange = <K extends keyof EmailSettings>(key: K, value: EmailSettings[K]) => {
    if (key === 'enabled' || key === 'sendImmediately' || key === 'ccStaffOnStudentEmails') return; // Prevent changes to removed toggles
    const updatedSettings = { ...settings, [key]: value }
    setSettings(updatedSettings)
    saveSettings(updatedSettings)
  }

  const handleTemplateChange = (templateId: string, field: keyof EmailTemplate, value: string) => {
    setSettings(prev => {
      if (!prev) return prev // If settings are not loaded, do nothing
      // I update the template in a type-safe way, ensuring all fields are present
      return {
        ...prev,
        templates: prev.templates.map(template =>
          template.id === templateId ? { ...template, [field]: value } : template
        ),
      }
    })
  }

  const sendTestEmail = async () => {
    if (!testEmail) return
    
    setTestLoading(true)
    setTestResult(null)

    try {
      const template = settings.templates.find(t => t.id === selectedTemplate)
      if (!template) throw new Error("Template not found")

      // I create sample data for testing the template
      const sampleData = {
        studentName: "John Doe",
        interactionType: "Career Counseling",
        sessionDate: new Date().toLocaleDateString(),
        notes: "Student showed great interest in technology careers. Discussed portfolio development and internship opportunities. Next steps include updating LinkedIn profile and applying to 3 internships.",
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        staffName: "Jane Smith",
        staffEmail: "jane.smith@launchpadphilly.org",
        reason: "Career exploration and guidance"
      }

      // I replace template variables with sample data
      let emailSubject = template.subject
      let emailBody = template.body

      Object.entries(sampleData).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g')
        emailSubject = emailSubject.replace(regex, value)
        emailBody = emailBody.replace(regex, value)
      })

      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmail,
          subject: emailSubject,
          body: emailBody,
          from: `${settings.fromName} <${settings.fromEmail}>`,
          replyTo: settings.replyTo
        })
      })

      if (response.ok) {
        setTestResult(`Test email sent successfully to ${testEmail}`)
      } else {
        setTestResult("Failed to send test email")
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      setTestResult("Error sending test email")
    } finally {
      setTestLoading(false)
    }
  }

  const addTemplate = () => {
    const newTemplate = {
      id: `template-${Date.now()}`, // Use a timestamp to ensure unique IDs
      name: "New Template",
      subject: "Default Subject",
      body: "Default Body",
      variables: []
    };
    const updatedSettings = {
      ...settings,
      templates: [...settings.templates, newTemplate]
    };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
  };

  const deleteTemplate = (templateId: string) => {
    const updatedSettings = {
      ...settings,
      templates: settings.templates.filter(template => template.id !== templateId)
    };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
  };

  const currentTemplate = settings.templates.find(t => t.id === selectedTemplate)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
          </CardTitle>
          <CardDescription>
            Configure email settings for student and staff notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General Settings</TabsTrigger>
              <TabsTrigger value="templates">Email Templates</TabsTrigger>
              <TabsTrigger value="testing">Testing</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={settings.fromName}
                    onChange={(e) => handleSettingsChange('fromName', e.target.value)}
                    placeholder="Launchpad Student Services"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={settings.fromEmail}
                    disabled // Make the field read-only
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bccAdmin">BCC Admin on All Emails</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="bccAdmin"
                      checked={settings.bccAdmin}
                      onCheckedChange={(checked) => handleSettingsChange('bccAdmin', checked)}
                    />
                  </div>
                </div>

                {settings.bccAdmin && (
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={settings.adminEmail}
                      onChange={(e) => handleSettingsChange('adminEmail', e.target.value)}
                      placeholder="admin@launchpadphilly.org"
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Email Templates</h3>
                  <Button onClick={addTemplate}>Add Template</Button>
                </div>

                {settings.templates.map((template, index) => (
                  <div key={template.id || `template-${index}`} className="space-y-4 border p-4 rounded-md">
                    <div className="flex items-center justify-between">
                      <h4 className="text-md font-medium">{template.name || "Untitled Template"}</h4>
                      <Button variant="destructive" onClick={() => deleteTemplate(template.id)}>
                        Delete
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`template-name-${template.id}`}>Template Name</Label>
                      <Input
                        id={`template-name-${template.id}`}
                        value={template.name}
                        onChange={(e) => handleTemplateChange(template.id, "name", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`template-subject-${template.id}`}>Email Subject</Label>
                      <Input
                        id={`template-subject-${template.id}`}
                        value={template.subject}
                        onChange={(e) => handleTemplateChange(template.id, "subject", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`template-body-${template.id}`}>Email Body</Label>
                      <Textarea
                        id={`template-body-${template.id}`}
                        value={template.body}
                        onChange={(e) => handleTemplateChange(template.id, "body", e.target.value)}
                        rows={6}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="testing" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testTemplate">Template to Test</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.templates.map(template => (
                         <SelectItem key={template.id} value={template.id}>
                           {template.name}
                         </SelectItem>
                       ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testEmail">Test Email Address</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>

                <Button
                  onClick={sendTestEmail}
                  disabled={!testEmail || testLoading}
                  className="w-full"
                >
                  {testLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending Test Email...
                    </>
                  ) : (
                    <>
                      <TestTube className="h-4 w-4 mr-2" />
                      Send Test Email
                    </>
                  )}
                </Button>

                {testResult && (
                  <div className={`p-3 rounded-md text-sm ${
                    testResult.includes('successfully') 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {testResult}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Email Preview</Label>
                  <div className="border rounded-md p-4 bg-gray-50 space-y-2">
                    <div className="text-sm">
                      <strong>Subject:</strong> {currentTemplate?.subject.replace(/{{(\w+)}}/g, '[Sample $1]')}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">
                      <strong>Body:</strong><br />
                      {currentTemplate?.body.replace(/{{(\w+)}}/g, '[Sample $1]')}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Save Email Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
