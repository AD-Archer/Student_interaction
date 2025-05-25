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
  { url: '/images/kwan.jpg', description: 'Kwan' },
  { url: '/images/logos/antonioarcherlogo.png', description: 'Antonio Archer Logo' },
  { url: '/images/logos/lp_logo_black.svg', description: 'Launchpad Logo Black' },
  { url: '/images/logos/lp_logo_transparent.png', description: 'Launchpad Logo Transparent' },
  { url: '/images/screenshots/desktop/ai_insights.png', description: 'AI Insights Desktop Screenshot' },
  { url: '/images/screenshots/desktop/analytics.png', description: 'Analytics Desktop Screenshot' },
  { url: '/images/screenshots/desktop/frontpage.png', description: 'Frontpage Desktop Screenshot' },
  { url: '/images/screenshots/desktop/settings.png', description: 'Settings Desktop Screenshot' },
  { url: '/images/screenshots/mobile/Ai_insights.png', description: 'AI Insights Mobile Screenshot' },
  { url: '/images/screenshots/mobile/analytics.png', description: 'Analytics Mobile Screenshot' },
  { url: '/images/screenshots/mobile/create.png', description: 'Create Mobile Screenshot' },
  { url: '/images/screenshots/mobile/dashboard.png', description: 'Dashboard Mobile Screenshot' },
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

