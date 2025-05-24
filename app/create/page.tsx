import { MobileForm } from "@/components/mobile-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { MobileHeader } from "@/components/mobile-header"

export default function CreateInteractionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <MobileHeader />

      <main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/">
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Student Interaction Form</CardTitle>
              <CardDescription>Fill out all required fields to log the student interaction</CardDescription>
            </CardHeader>
            <CardContent>
              <MobileForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
