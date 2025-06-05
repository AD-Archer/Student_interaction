/**
 * app/layout.tsx
 * Root layout for Launchpad Student Form. Sets up global font, authentication context, and global layout wrapper.
 * Also injects SEO, favicon, and social media meta tags to ensure the Launchpad Logo Black is used as the site icon and preview image.
 * All pages and components are rendered within this layout.
 */

import type React from "react";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { AuthWrapper } from "@/components/auth-wrapper";
import { GlobalLayout } from "@/components/global-layout";
import { notFound } from 'next/navigation';

const inter = Inter({ subsets: ["latin"] });

const imageReferences = [
  { url: '/launchpadlogo.png', description: 'Launchpad Philly Logo' },
  { url: '/images/logos/lp_logo_black.svg', description: 'Launchpad Logo Black' },
  { url: '/images/logos/lp_logo_transparent.png', description: 'Launchpad Logo Transparent' },
  { url: '/images/logos/antonioarcherlogo.png', description: 'Antonio Archer Logo' },
  { url: '/images/kwan.jpg', description: 'Kwan' },
  // Final site screenshots (desktop)
  { url: '/images/production_screenshots/final_desktop_home.png', description: 'Final Home Page (Desktop)' },
  { url: '/images/production_screenshots/final_desktop_analytics.png', description: 'Final Analytics (Desktop)' },
  { url: '/images/production_screenshots/final_desktop_ai_insights.png', description: 'Final AI Insights (Desktop)' },
  { url: '/images/production_screenshots/final_desktop_settings.png', description: 'Final Settings (Desktop)' },
  // Final site screenshots (mobile)
  { url: '/images/production_screenshots/final_mobile_home.png', description: 'Final Home Page (Mobile)' },
  { url: '/images/production_screenshots/final_mobile_analytics.png', description: 'Final Analytics (Mobile)' },
  { url: '/images/production_screenshots/final_mobile_ai_insights.png', description: 'Final AI Insights (Mobile)' },
  { url: '/images/production_screenshots/final_mobile_settings.png', description: 'Final Settings (Mobile)' },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Favicon and Apple Touch Icon */}
        <link rel="icon" type="image/svg+xml" href="/images/logos/lp_logo_white_text.png" />
        <link rel="apple-touch-icon" href="/images/logos/lp_logo_white_text.png" />
        {/* Open Graph Meta Tags for Social Media */}
        <meta property="og:title" content="Launchpad Philly Student Form" />
        <meta property="og:description" content="Student interaction tracking system for  Launchpad Philly, developed by Antonio Archer." />
        <meta property="og:image" content="/images/logos/lp_logo_white_text.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://launchpadphilly.org/" />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Launchpad Philly Student Form" />
        <meta name="twitter:description" content="Student interaction tracking system for Launchpad Philly, developed by Antonio Archer." />
        <meta name="twitter:image" content="/images/logos/lp_logo_white_text.png" />
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              'name': 'Launchpad Philly Student Form',
              'description': 'Student interaction tracking system for Launchpad Philly, developed by Antonio Archer.',
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

export { notFound, imageReferences };

