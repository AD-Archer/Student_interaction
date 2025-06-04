// -----------------------------------------------------------------------------
// app/create/page.tsx
// This page renders the student interaction creation/editing form. It detects
// the 'id' query parameter to determine if the user is editing an existing
// interaction, and passes it to the form for prefill and update logic.
// -----------------------------------------------------------------------------

"use client"

import { Form } from "@/app/create/components/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"


export default function CreateInteractionPage() {


  // I check for an 'id' query parameter to support editing
  const searchParams = useSearchParams()
  const id = searchParams?.get("id")

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Add ToastContainer to render toast notifications */}

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
              {/* I pass the id (if present) to the form for edit mode */}
              <Form interactionId={id ? Number(id) : undefined} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
