import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { AuthWrapper } from "@/components/auth-wrapper"
import { GlobalLayout } from "@/components/global-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Launchpad Philly Student Form - Building 21",
  description: "Student interaction tracking system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Add meta tags for SEO */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="Building 21 Workforce Development" />
        <meta name="keywords" content="Launchpad, Building 21, Workforce Development, Student Tracking" />
        <meta name="robots" content="index, follow" />
        <link rel="icon" href="/favicon.svg" />
        <meta property="og:image" content="/launchpadlogo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/launchpadlogo.png" />
        <meta name="twitter:title" content="Launchpad Philly Student Form - Building 21" />
        <meta name="twitter:description" content="Student interaction tracking system" />
      </head>
      <body className={inter.className}>
        <AuthWrapper>
          <GlobalLayout>
            {children}
          </GlobalLayout>
        </AuthWrapper>

        {/* Footer */}
        <footer className="bg-gray-100 text-center text-sm text-gray-500 py-4">
          <p>© {new Date().getFullYear()} Launchpad Philly</p>

        </footer>
      </body>
    </html>
  )
}
