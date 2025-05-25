import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { AuthWrapper } from "@/components/auth-wrapper";
import { GlobalLayout } from "@/components/global-layout";
import { notFound } from 'next/navigation';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Launchpad Philly Student Interaction Tracker - Building 21",
  description: "Student interaction tracking system for Building 21 Workforce Development",
  metadataBase: new URL("https://interactiontracker.launchpadphilly.org"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Launchpad Philly Student Interaction Tracker - Building 21",
    description: "Student interaction tracking system for Building 21 Workforce Development.",
    url: "https://interactiontracker.launchpadphilly.org",
    siteName: "Launchpad Philly Student Interaction Tracker",
    images: [
      {
        url: "/launchpadlogo.png",
        width: 1200,
        height: 630,
        alt: "Launchpad Philly Logo",
      },
      {
        url: "/images/kwan.jpg",
        width: 1200,
        height: 630,
        alt: "Kwan",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Launchpad Philly Student Interaction Tracker - Building 21",
    description: "Student interaction tracking system for Building 21 Workforce Development.",
    images: ["/launchpadlogo.png"],
    creator: "@ad_archer_",
  },
  keywords: [
    "Launchpad Philly",
    "Building 21",
    "Workforce Development",
    "Student Tracking",
    "Education Management",
    "Student Progress",
    "Antonio Archer",
  ],
  authors: [{ name: "Antonio Archer", url: "https://www.antonioarcher.com" }],
  creator: "Antonio Archer",
  publisher: "Building 21 Workforce Development",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/launchpadlogo.png",
    shortcut: "/launchpadlogo.png",
    other: [  { rel: "apple-touch-icon", url: "/launchpadlogo.png" }],
    apple: "/launchpadlogo.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const keywordsString = Array.isArray(metadata.keywords) ? metadata.keywords.join(", ") : metadata.keywords || "";

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              'name': 'Launchpad Philly Student Form',
              'description': 'Student interaction tracking system for Building 21 Workforce Development program Launchpad Philly, developed by Antonio Archer.',
              'applicationCategory': 'EducationManagementTool',
              'operatingSystem': 'All',
              'author': {
                '@type': 'Person',
                'name': 'Antonio Archer',
                'url': 'https://www.antonioarcher.com',
                'jobTitle': 'Software Developer',
                'sameAs': [
                  'https://www.github.com/ad-archer',
                  'https://www.linkedin.com/in/antonio-archer',
                  'https://www.twitter.com/ad_archer_',
                  'https://www.adarcher.app'
                ]
              },
              'publisher': {
                '@type': 'Organization',
                'name': 'Launchpad Philly',
                'logo': {
                  '@type': 'ImageObject',
                  'url': 'https://launchpadphilly.org/'
                }
              },
              'datePublished': '2025-05-25',
              'offers': {
                '@type': 'Offer',
                'price': '0',
                'priceCurrency': 'USD'
              },
              'keywords': keywordsString
            }),
          }}
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>
        <AuthWrapper>
          <GlobalLayout>
            {children}
          </GlobalLayout>
        </AuthWrapper>
        <footer className="bg-background border-t text-center text-sm text-muted-foreground py-4">
          <p>© {new Date().getFullYear()} Launchpad Philly - Student Interaction Tracker</p>
        </footer>
      </body>
    </html>
  );
}

export { notFound };

