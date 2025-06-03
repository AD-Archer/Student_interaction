/**
 * EmailTest.tsx
 * Email testing component for the settings page.
 * Allows administrators to test email functionality by sending test emails.
 * This is only used on the /settings page and is not global.
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, CheckCircle, XCircle, Clock, Send } from "lucide-react"
import React, { useState } from "react"

interface EmailTestResult {
  success: boolean
  message: string
  details?: {
    messageId?: string
    recipient?: string
    timestamp?: string
  }
}

export const EmailTest = () => {
  const [testEmail, setTestEmail] = useState("")
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<EmailTestResult | null>(null)

  const sendTestEmail = async () => {
    if (!testEmail.trim()) {
      setTestResult({
        success: false,
        message: "Please enter a valid email address"
      })
      return
    }

    setTesting(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: testEmail }),
      })

      const result = await response.json()
      
      setTestResult({
        success: result.success,
        message: result.message,
        details: result.details
      })

    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send test email'
      })
    } finally {
      setTesting(false)
    }
  }

  const getResultIcon = () => {
    if (!testResult) return null
    
    if (testResult.success) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    } else {
      return <XCircle className="h-4 w-4 text-red-600" />
    }
  }

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
          <Mail className="h-5 w-5 text-blue-600" />
          <span>Email System Test</span>
        </CardTitle>
        <CardDescription>Test email functionality by sending a test message</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email Input */}
        <div className="space-y-2">
          <Label htmlFor="test-email">Test Email Address</Label>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Input
              id="test-email"
              type="email"
              placeholder="Enter email address to test..."
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1"
              disabled={testing}
            />
            <Button 
              onClick={sendTestEmail}
              disabled={testing || !testEmail.trim()}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              {testing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Email
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Test Results */}
        {testResult && (
          <div className={`p-4 rounded-lg border ${
            testResult.success 
              ? 'bg-green-50 text-green-800 border-green-200' 
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            <div className="flex items-start space-x-2">
              {getResultIcon()}
              <div className="flex-1 min-w-0">
                <p className="font-medium">{testResult.message}</p>
                
                {testResult.success && testResult.details && (
                  <div className="mt-2 text-sm opacity-90">
                    <p><strong>Recipient:</strong> {testResult.details.recipient}</p>
                    {testResult.details.messageId && (
                      <p><strong>Message ID:</strong> {testResult.details.messageId}</p>
                    )}
                    {testResult.details.timestamp && (
                      <p><strong>Sent:</strong> {new Date(testResult.details.timestamp).toLocaleString()}</p>
                    )}
                  </div>
                )}
                
                {testResult.success && (
                  <div className="mt-3 p-3 bg-white/50 rounded border text-sm">
                    <p className="font-medium mb-1">✅ Email Configuration Working</p>
                    <p>Your system can now send:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Follow-up reminders to students</li>
                      <li>Notifications to staff members</li>
                      <li>System alerts and updates</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Email Configuration Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Mail className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Email Configuration</p>
              <p><strong>From:</strong> {process.env.NEXT_PUBLIC_EMAIL_FROM || 'noreply.lp.studentform@gmail.com'}</p>
              <p><strong>Host:</strong> {process.env.NEXT_PUBLIC_EMAIL_HOST || 'smtp.gmail.com'}</p>
              <p className="mt-2 text-xs opacity-75">
                Test emails will be sent using the configured SMTP settings in your environment variables.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
